import { SocketEventsName } from "@/constants";
import { ExpoServerSDK } from "@/helpers";
import { Transaction } from "@/lib";
import {
  BillModel,
  Booking,
  BookingDetail,
  BookingDetailModel,
  BookingModel,
  Discount,
  DiscountModel,
  Employee,
  Notification,
  NotificationModel,
  NotificationTypes,
  Rate,
  RoomModel,
  RoomPrice,
  TaxModel,
  Voucher,
  VoucherModel,
  ZaloPayTransaction,
  ZaloPayTransactionModel,
} from "@/models";
import {
  BookingDeskTopInput,
  BookingInputCreate,
  BookingInputUpdate,
  GetBookingDetailsQuery,
  PaymentBookingInput,
} from "@/schema";
import {
  BadRequestError,
  NotFoundRequestError,
  calcPriceWithTax,
  compareDateVoucher,
  dateFormat,
  dateTimeSql,
  encodeBase64,
  generateUUID,
  generateUUIDv2,
  getInfoData,
  isNull,
} from "@/utils";
import dayjs from "dayjs";
import { raw } from "mysql2";
import type { Server, Server as SocketServer } from "socket.io";
import { ObjectType, Pagination } from "types";
import BillService from "./Bill.service";
import BookingDetailService from "./BookingDetail.service";
import CustomerService from "./Customer.service";
import EmployeeService from "./Employee.service";
import RateService from "./Rate.service";
import RoomService from "./Room.service";
import SaveExpoPushTokenService from "./SaveExpoPushToken.service";
import VoucherService from "./Voucher.service";
import ZaloPayService from "./ZaloPay.service";
import ZaloPayTransactionService from "./ZaloPayTransaction.service";

type ResponseGetAll = Booking & {
  customer: Pick<
    Awaited<ReturnType<typeof CustomerService.getById>>,
    "display_name" | "birth_date" | "address" | "email" | "phone_number" | "photo"
  >;
  employee: null | Employee;
  rate: Rate | null;
  bookingDetails: Awaited<ReturnType<typeof BookingDetailService.getAll>>["results"];
};

class BookingService {
  /**
   * @description
   * 1. Validation real email or phone number.
   * 2. Searching count room available and select room data.
   * 3. Validation guest over max people of room.
   * 4. Check room_quantity over room available.
   * 5. Check if exists voucher
   * 6. Calculate total price with tax VAT.
   * 7. Check payment offline or online.
   * 8. Create booking, booking details.
   * 9. Create notification.
   * 10. Push notification mobile & send socketIO.
   * 11. Send email, phone number.
   * 12. return true.
   * @param data
   * @returns
   */
  static create = async (data: BookingInputCreate, socketIO: Server) => {
    // return "ok";
    const {
      room_id,
      check_in,
      check_out,
      room_quantity,
      adults,
      children,
      total_night,
      payment,
      customer_id,
      note,
    } = data;

    // 1. temp pass
    // 2.
    const [roomAvailable, room, taxResults] = await Promise.all([
      RoomModel.getRoomNumberAvailability({
        checkIn: check_in,
        checkOut: check_out,
        roomId: room_id,
      }),
      RoomService.getById(room_id),
      TaxModel.getTaxVAT(),
    ]);

    let discountId: string = "";

    if (room.discount) {
      if (room.discount && room.discount.status !== "expired" && room.discount.is_public) {
        discountId = room.discount.id!;
        if (
          room.discount.num_discount !== 0 &&
          (room.discount.code_used || 0) + room_quantity > room.discount.num_discount
        ) {
          throw new BadRequestError(`Số lượng giảm giá đã vượt quá số lượng cho phép`);
        }
      }
    }

    if (!roomAvailable.length) {
      throw new BadRequestError(`Số lượng phòng đã hết. Vui lòng thử lại sau`);
    }

    // 3.
    if (Number(adults) > room.adults) {
      throw new BadRequestError(`Số lượng khách đã vượt quá ${room.adults}`);
    }

    // 4.
    if (Number(room_quantity) > roomAvailable.length) {
      throw new BadRequestError(`Số lượng phòng đã vượt quá số lượng có sẵn.`);
    }

    // 5.
    let priceWithVoucher = 0;

    const roomPrice = room.roomType.prices?.price_online!;

    if (data?.voucher) {
      const getVoucher = await VoucherService.findOne({ id: data.voucher });
      if (!getVoucher) throw new NotFoundRequestError(`Mã voucher không hợp lệ.`);
      const currentDateTime = new Date();
      const timeEnd = getVoucher.time_end;
      const compare = compareDateVoucher(currentDateTime, timeEnd);
      const { quantity_used, num_voucher, is_public, percent_voucher, type, price_voucher } =
        getVoucher;

      if (!is_public) {
        throw new NotFoundRequestError(`Không tìm thấy mã voucher`);
      }

      if (compare < 0) {
        throw new BadRequestError(`Mã voucher của bạn đã hết hạn.`);
      }

      if (quantity_used + 1 > num_voucher) {
        throw new BadRequestError(`Số lượng voucher đã hết`);
      }

      if (type === "percent") {
        priceWithVoucher = roomPrice * percent_voucher!;
      } else {
        priceWithVoucher = price_voucher!;
      }
    }

    let resultsPrice = roomPrice * total_night * room_quantity - priceWithVoucher;

    if (room?.discount) {
      resultsPrice = DiscountModel.calcWithDiscount(resultsPrice, room.discount.price);
    }

    const totalPrice = calcPriceWithTax(resultsPrice, taxResults);

    const roomNumber = roomAvailable.slice(0, room_quantity);

    // 8.
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const bookingId = dateTimeSql(undefined, "DDMMYYYYHHmmss");

    try {
      await connection.beginTransaction();

      await transaction.create<Booking>({
        data: {
          id: bookingId,
          customer_id,
          payment: payment as "online" | "offline" | "transfer" | "others",
          status: "pending_confirmation",
          total_price: totalPrice,
          total_room: room_quantity,
          voucher: data?.voucher ? data?.voucher : null,
          is_booked_online: 1,
          mode_booking: "day",
        },
        pool: connection,
        table: BookingModel.getTable,
      });

      const bookingDetailsData = roomNumber.map((row) => {
        const bookingDetailsId = generateUUIDv2("BD");

        return {
          bookingDetailsId,
          bookingId,
          roomNumberId: row.id,
          roomId: row.room_id,
          checkIn: dateFormat(check_in),
          checkOut: dateFormat(check_out),
          adults,
          children,
          note,
          status: "pending_payment",
        };
      });

      const bookingDetailsInserts = bookingDetailsData.map((row) => {
        return [
          row.bookingDetailsId,
          row.bookingId,
          row.roomNumberId,
          row.roomId,
          row.checkIn,
          row.checkOut,
          null, // checked_in
          row.adults,
          row.children,
          row.note,
          room?.discount?.id || null, // discount_id
          null, // last_room_number_transfer
          null, // checked_out
          row.status,
          null,
        ];
      });

      await transaction.createBulk({
        data: bookingDetailsInserts,
        pool: connection,
        table: BookingDetailModel.getTable,
        fillables: BookingDetailModel.getFillables,
        withId: true,
      });

      const billInsert = bookingDetailsData.map((row) => {
        const billId = generateUUIDv2("BI");

        const costRoom = totalPrice / room_quantity;

        const billInsertData = [
          billId, // id
          null, // employee_id
          row.bookingDetailsId, // booking_details_id
          costRoom, // total_price
          "online", // payment
          0, // deposit
          0, // change
          0, // price_received
          costRoom, // cost_room
          0, // cost_service
          0, // cost_room_paid
          0, // cost_over_checkout
          0, // cost_last_checkin
          0, // cost_late_checkout
          null, // change_room_bill
          null, // note
          "unpaid", //  status
          null, // deleted_at
        ];

        return billInsertData;
      });

      await Promise.all([
        transaction.createBulk({
          data: billInsert,
          pool: connection,
          table: BillModel.getTable,
          fillables: BillModel.getFillables,
          withId: true,
        }),
        discountId
          ? transaction.update<Partial<Discount>, Discount>({
              data: { code_used: (room.discount?.code_used || 0) + room_quantity },
              pool: connection,
              table: DiscountModel.getTable,
              key: "id",
              valueOfKey: discountId,
            })
          : null,
      ]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    // TODO: payment online

    // const response = await MomoService.collectionLink({
    //   amount: totalPrice,
    //   orderId: generateUUIDv2("MOMO"),
    //   orderInfo: "Thanh toán đặt phòng. Mã booking " + bookingId,
    //   partnerCode: "MOMO",
    //   bookingId: bookingId,
    //   extraData: encodeBase64({ type: "booking" }),
    // });

    // console.log(`url`, response);

    const response = await ZaloPayService.requestPayment({
      amount: totalPrice,
      appUser: bookingId,
      description: "Thanh toán đặt phòng",
      extraData: { type: encodeBase64("booking") },
      title: "Thanh toán đặt phòng",
      bookingId: bookingId,
      isBooking: true,
    });

    // 11.
    return { url: response, bookingId: bookingId };
  };

  static update = async (data: BookingInputUpdate["body"], id: number) => {
    let Booking: Booking | boolean;

    if (!(await BookingModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await BookingModel.findOne<Booking>({ id: id, deleted_at: isNull() });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const [customer, zaloPayTransaction] = await Promise.all([
      CustomerService.getById(data.customer_id),
      ZaloPayTransactionService.getAll({ booking_id: id }, { order: "created_at", limit: 9999 }),
    ]);

    return {
      ...data,
      customerData: getInfoData(customer, ["display_name", "id", "phone_number", "email"]),
      zaloPayTransaction: zaloPayTransaction.results[0] || null,
    };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    filters = { deleted_at: isNull(), ...filters };

    const results = await BookingModel.findAll<Booking>(filters, undefined, options);

    const total = await BookingModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<ResponseGetAll> =>
          new Promise(async (resolve, reject) => {
            try {
              const [customer, employee, rate, bookingDetails] = await Promise.all([
                CustomerService.getById(row.customer_id),
                row.employee_id
                  ? EmployeeService.findOne({ id: row.employee_id }, "-password")
                  : null,

                RateService.findOne({ booking_id: row.id }),
                BookingDetailService.getAll({ booking_id: row.id }, {}),
              ]);

              const { display_name, birth_date, address, email, phone_number, photo, ...others } =
                customer;

              const dataCustomer = {
                display_name,
                birth_date,
                address,
                email,
                phone_number,
                photo,
              };

              resolve({
                ...row,
                rate: rate || null,
                customer: dataCustomer,
                employee: employee || null,
                bookingDetails: bookingDetails.results,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Booking>) => {
    return await BookingModel.findOne<Booking>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await BookingModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static bookingDesktop = async (data: BookingDeskTopInput) => {
    const { rooms, customerId, employeeId, modeCheckPrice, note } = data;

    await Promise.all(
      rooms.map(
        (room) =>
          new Promise(async (resolve, reject) => {
            try {
              if (room.discount && room.discount.status !== "expired" && room.discount.is_public) {
                if (
                  room.discount.num_discount !== 0 &&
                  (room.discount.code_used || 0) + totalRoom > room.discount.num_discount
                ) {
                  throw new BadRequestError(`Số lượng giảm giá đã vượt quá số lượng cho phép`);
                }
              }

              const roomAvailable = await RoomService.searchingRoomAvailable({
                check_in: room.checkIn,
                check_out: room.checkOut,
                room_id: room.roomId,
              });

              if (roomAvailable === 0 || !roomAvailable) {
                throw new BadRequestError(
                  `Loại phòng \`${room.name}\` đã hết. Vui lòng refresh trang để cập nhật`
                );
              }

              resolve(true);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    const totalRoom = rooms.reduce((total, r) => (total += r.quantity), 0);

    const bookingId = dateTimeSql(undefined, "DDMMYYYYhhmmss");

    let getVoucher: false | Voucher = false;

    if (data?.voucher) {
      getVoucher = await VoucherService.findOne({ id: data.voucher });

      if (!getVoucher) throw new NotFoundRequestError(`Mã voucher không hợp lệ.`);

      const currentDateTime = new Date();
      const timeEnd = getVoucher.time_end;
      const compare = compareDateVoucher(currentDateTime, timeEnd);
      const { quantity_used, num_voucher, is_public } = getVoucher;

      if (!is_public) {
        throw new NotFoundRequestError(`Không tìm thấy mã voucher`);
      }

      if (compare < 0) {
        throw new BadRequestError(`Mã voucher của bạn đã hết hạn.`);
      }

      if (quantity_used + 1 > num_voucher) {
        throw new BadRequestError(`Số lượng voucher đã hết`);
      }
    }

    const transaction = new Transaction();
    const [connection, tax] = await Promise.all([
      transaction.getPoolTransaction(),
      TaxModel.getTaxVAT(),
    ]);

    const totalPrice = rooms.reduce((total, r) => {
      const price = calcPriceWithTax(r.totalCost, tax);
      return (total += price);
    }, 0);

    // throw new InternalServerRequestError(`Maintain System`);

    try {
      await connection.beginTransaction();

      await transaction.create<Booking>({
        data: {
          customer_id: customerId,
          mode_booking: modeCheckPrice,
          payment: "others",
          status: "confirmed",
          total_price: totalPrice,
          total_room: totalRoom,
          id: bookingId,
          employee_id: employeeId,
          voucher: data.voucher,
        },
        pool: connection,
        table: BookingModel.getTable,
      });

      const bookingDetailsInsertsBulk: any[][] = [];
      const billInsertBulk: any[][] = [];

      const length = rooms.length;

      for (let index = 0; index < length; index++) {
        const room = rooms[index];

        const lengthRoomNumber = room.roomNumberSelected.length;

        for (let _index = 0; _index < lengthRoomNumber; _index++) {
          const bookingDetailsId = generateUUID("BD");
          const billInsertId = generateUUIDv2("BI");

          const roomNumber = room.roomNumberSelected[_index];

          const dataInsert = [
            bookingDetailsId,
            bookingId,
            roomNumber.id,
            room.roomId,
            room.checkIn,
            room.checkOut,
            null, // checked-in
            room.adults,
            room.children,
            null, // note
            room?.discount?.id || null,
            null, // last_room_number_transfer
            null, // checked_out
            "confirmed", // status
            null, // deleted_at
          ];

          const totalPrice = calcPriceWithTax(room.totalCost, tax);
          const costRoom = totalPrice;

          const billInsert = [
            billInsertId, // id
            employeeId, // employee_id
            bookingDetailsId, // booking_details_id
            totalPrice, // total_price
            "offline", // payment
            0, // deposit
            0, // change
            0, // price_received
            costRoom, // cost_room
            0, // cost_service
            0, // cost_room_paid
            0, // cost_over_checkout
            0, // cost_last_checkin
            0, // cost_late_checkout

            null, // change_room_bill
            null, // note
            "unpaid", //  status
            null, // deleted_at
          ];

          bookingDetailsInsertsBulk.push(dataInsert);
          billInsertBulk.push(billInsert);
        }
      }

      const notificationInsert: Notification = {
        actor_type: "employee",
        body: `Đặt phòng thành công lúc ${dayjs().format(
          "DD/MM/YYYY HH:mm:ss"
        )}. Có id đặt phòng là ${bookingId}`,
        entity_id: bookingId,
        entity_name: BookingModel.getTable,
        title: "Đặt phòng thành công.",
        user_id: customerId,
        notification_type: NotificationTypes.FRONT_DESK_BOOKING_SUCCESS,
        is_system: 1,
      };

      await Promise.all([
        transaction.createBulk({
          pool: connection,
          data: bookingDetailsInsertsBulk,
          fillables: BookingDetailModel.getFillables,
          table: BookingDetailModel.getTable,
          withId: true,
        }),
        transaction.createBulk({
          pool: connection,
          data: billInsertBulk,
          fillables: BillModel.getFillables,
          table: BillModel.getTable,
          withId: true,
        }),
        transaction.create<Notification>({
          data: notificationInsert,
          pool: connection,
          table: NotificationModel.getTable,
        }),
        ...rooms.map(
          (room) =>
            new Promise(async (resolve, reject) => {
              try {
                if (
                  room.discount &&
                  room.discount.status !== "expired" &&
                  room.discount.is_public
                ) {
                  const codeUse = Number(room.quantity) + Number(room.discount.code_used || 0);

                  if (room.discount.num_discount !== 0 && codeUse > room.discount.num_discount)
                    return resolve(true);

                  await transaction.update<Partial<Discount>, Discount>({
                    data: {
                      code_used: codeUse,
                    },
                    key: "id",
                    pool: connection,
                    table: DiscountModel.getTable,
                    valueOfKey: room.discount.id,
                  });
                }

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        ),
        getVoucher
          ? transaction.update<Partial<Voucher>, Voucher>({
              data: {
                quantity_used: Number(1) + Number(getVoucher.quantity_used || 0),
              },
              key: "id",
              pool: connection,
              table: VoucherModel.getTable,
              valueOfKey: getVoucher.id!,
            })
          : null,
      ]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return bookingId;
  };

  static receiveRoomDesktop = async (data: BookingDeskTopInput) => {
    const { rooms, customerId, employeeId, modeCheckPrice, note } = data;

    await Promise.all(
      rooms.map(
        (room) =>
          new Promise(async (resolve, reject) => {
            try {
              const roomAvailable = await RoomService.searchingRoomAvailable({
                check_in: room.checkIn,
                check_out: room.checkOut,
                room_id: room.roomId,
              });

              if (room.discount && room.discount.status !== "expired" && room.discount.is_public) {
                if (
                  room.discount.num_discount !== 0 &&
                  (room.discount.code_used || 0) + totalRoom > room.discount.num_discount
                ) {
                  throw new BadRequestError(`Số lượng giảm giá đã vượt quá số lượng cho phép`);
                }
              }

              if (roomAvailable === 0 || !roomAvailable) {
                throw new BadRequestError(
                  `Loại phòng \`${room.name}\` đã hết. Vui lòng refresh trang để cập nhật`
                );
              }

              resolve(true);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    const totalRoom = rooms.reduce((total, r) => (total += r.quantity), 0);

    const bookingId = dateTimeSql(undefined, "DDMMYYYYhhmmss");

    const transaction = new Transaction();

    const [connection, tax] = await Promise.all([
      transaction.getPoolTransaction(),
      TaxModel.getTaxVAT(),
    ]);

    let getVoucher: false | Voucher = false;

    if (data?.voucher) {
      getVoucher = await VoucherService.findOne({ id: data.voucher });

      if (!getVoucher) throw new NotFoundRequestError(`Mã voucher không hợp lệ.`);

      const currentDateTime = new Date();
      const timeEnd = getVoucher.time_end;
      const compare = compareDateVoucher(currentDateTime, timeEnd);
      const { quantity_used, num_voucher, is_public } = getVoucher;

      if (getVoucher.status === "expired") {
        throw new BadRequestError(`Mã voucher của bạn đã hết hạn.`);
      }

      if (!is_public) {
        throw new NotFoundRequestError(`Không tìm thấy mã voucher`);
      }

      if (compare < 0) {
        throw new BadRequestError(`Mã voucher của bạn đã hết hạn.`);
      }

      if (num_voucher !== 0 && quantity_used + totalRoom > num_voucher) {
        throw new BadRequestError(`Số lượng voucher đã hết`);
      }
    }

    const totalPrice = rooms.reduce((total, r) => {
      const price = calcPriceWithTax(r.totalCost, tax);
      return (total += price);
    }, 0);

    try {
      await connection.beginTransaction();

      await transaction.create<Booking>({
        data: {
          customer_id: customerId,
          mode_booking: modeCheckPrice,
          payment: "offline",
          status: "in_progress",
          total_price: totalPrice,
          total_room: totalRoom,
          id: bookingId,
          employee_id: employeeId,
          voucher: data.voucher,
        },
        pool: connection,
        table: BookingModel.getTable,
      });

      const bookingDetailsInsertsBulk: any[][] = [];
      const billInsertBulk: any[][] = [];

      const length = rooms.length;

      for (let index = 0; index < length; index++) {
        const room = rooms[index];

        const lengthRoomNumber = room.roomNumberSelected.length;

        for (let _index = 0; _index < lengthRoomNumber; _index++) {
          const bookingDetailsId = generateUUIDv2("BD");
          const billInsertId = generateUUIDv2("BI");

          const roomNumber = room.roomNumberSelected[_index];
          const totalPrice = calcPriceWithTax(room.totalCost, tax);
          const costRoom = totalPrice;

          let discount: Discount | null = room.discount;

          const durationCheckIn = BookingModel.checkInLate(room.checkIn);
          let priceCheckInLate = 0;

          if (durationCheckIn.late) {
            priceCheckInLate = BookingModel.calcPriceCheckInLate(
              durationCheckIn,
              discount,
              room.prices as RoomPrice,
              tax
            );
          }

          const dataInsert = [
            bookingDetailsId,
            bookingId,
            roomNumber.id,
            room.roomId,
            room.checkIn,
            room.checkOut,
            dateTimeSql(), // checked-in
            room.adults,
            room.children,
            null, // note
            room?.discount?.id || null,
            null, // last_room_number_transfer
            null, // checked_out
            "in_progress", // status
            null, // deleted_at
          ];

          const billInsert = [
            billInsertId, // id
            employeeId, // employee_id
            bookingDetailsId, // booking_details_id
            totalPrice, // total_price
            "offline", // payment
            0, // deposit
            0, // change
            0, // price_received
            costRoom, // cost_room
            0, // cost_service
            0, // cost_room_paid
            0, // cost_over_checkout
            priceCheckInLate, // cost_last_checkin
            0, // cost_late_checkout
            null, // change_room_bill
            null, // note
            "unpaid", //  status
            null, // deleted_at
          ];

          bookingDetailsInsertsBulk.push(dataInsert);
          billInsertBulk.push(billInsert);
        }
      }

      const notificationInsert: Notification = {
        actor_type: "employee", // Người thực hiện
        body: `Nhận phòng thành công lúc ${dayjs().format(
          "DD/MM/YYYY HH:mm:ss"
        )}. Có id đặt phòng là ${bookingId}`,
        entity_id: bookingId,
        entity_name: BookingModel.getTable,
        title: "Nhận phòng thành công.",
        user_id: customerId,
        notification_type: NotificationTypes.FRONT_DESK_RECEIVE_SUCCESS,
        is_system: 1,
      };

      await Promise.all([
        transaction.createBulk({
          pool: connection,
          data: bookingDetailsInsertsBulk,
          fillables: BookingDetailModel.getFillables,
          table: BookingDetailModel.getTable,
          withId: true,
        }),
        transaction.createBulk({
          pool: connection,
          data: billInsertBulk,
          fillables: BillModel.getFillables,
          table: BillModel.getTable,
          withId: true,
        }),
        transaction.create<Notification>({
          data: notificationInsert,
          pool: connection,
          table: NotificationModel.getTable,
        }),
        ...rooms.map(
          (room) =>
            new Promise(async (resolve, reject) => {
              try {
                if (
                  room.discount &&
                  room.discount.status !== "expired" &&
                  room.discount.is_public
                ) {
                  const codeUse = Number(room.quantity) + Number(room.discount.code_used || 0);

                  if (room.discount.num_discount !== 0 && codeUse > room.discount.num_discount)
                    return resolve(true);

                  await transaction.update<Partial<Discount>, Discount>({
                    data: {
                      code_used: codeUse,
                    },
                    key: "id",
                    pool: connection,
                    table: DiscountModel.getTable,
                    valueOfKey: room.discount.id,
                  });
                }

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        ),
        getVoucher
          ? transaction.update<Partial<Voucher>, Voucher>({
              data: {
                quantity_used: Number(1) + Number(getVoucher.quantity_used || 0),
              },
              key: "id",
              pool: connection,
              table: VoucherModel.getTable,
              valueOfKey: getVoucher.id!,
            })
          : null,
      ]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return bookingId;
  };

  static getBookingByCustomer = async (customerId: number) => {
    const response = await BookingService.getAll(
      { customer_id: customerId },
      { order: "created_at" }
    );

    const data = await Promise.all(
      response.results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const zaloPayTransaction = await ZaloPayTransactionService.getAll(
                { booking_id: row.id },
                { order: "created_at", limit: 9999 }
              );

              resolve({ ...row, zaloPayTransaction: zaloPayTransaction.results[0] });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return data;
  };

  static getBookingDetails = async (bookingId: GetBookingDetailsQuery["bookingId"]) => {
    const response = await BookingDetailService.getAll(
      { booking_id: bookingId, deleted_at: isNull() },
      { order: "room_number_id,asc" }
    );

    const results = await Promise.all(
      response.results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const [bill, room, zaloPayTransaction] = await Promise.all([
                BillService.findOne({ booking_details_id: row.id }),
                RoomService.getById(row.room_id),
                ZaloPayTransactionService.findOne({ booking_id: row.booking_id }),
              ]);

              const { room_numbers, roomType, ...otherRoom } = room;

              resolve({
                ...row,
                bill: bill || null,
                room: { ...otherRoom, roomType },
                zaloPayTransaction: zaloPayTransaction || null,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static confirmAllBooking = async (socketIO: SocketServer) => {
    const response = await BookingService.getAll(
      { status: "pending_confirmation" },
      { order: "created_at" }
    );

    if (!response.results.length) return 0;

    const transaction = new Transaction();

    const connection = await transaction.getPoolTransaction();

    try {
      await Promise.all(
        response.results.map(
          (row) =>
            new Promise(async (resolve, reject) => {
              try {
                const saveTokenExpo = await SaveExpoPushTokenService.findOne({
                  actor_type: "customer",
                  user_id: row.customer_id,
                });

                const notificationInsert: Notification = {
                  actor_type: "customer",
                  body: `Xác nhận phòng thành công lúc ${dayjs().format(
                    "DD/MM/YYYY HH:mm:ss"
                  )}. Mã đặt phòng là ${row.id}`,
                  entity_id: row.id!,
                  entity_name: BookingModel.getTable,
                  title: "Xác nhận thành công",
                  user_id: row.customer_id,
                  notification_type: NotificationTypes.CONFIRM_SUCCESS,
                };

                socketIO
                  .to(`${row.customer_id}`)
                  .emit(SocketEventsName.NOTIFICATION, notificationInsert);

                if (saveTokenExpo) {
                  const expo = new ExpoServerSDK();
                  await expo.pushToken({
                    to: saveTokenExpo.expo_push_token!,
                    body: notificationInsert.body,
                    title: notificationInsert.title,
                    sound: "default",
                  });
                }

                await Promise.all([
                  transaction.update<Partial<Booking>, Booking>({
                    data: { status: "confirmed" },
                    key: "id",
                    pool: connection,
                    table: BookingModel.getTable,
                    valueOfKey: row.id!,
                  }),
                  transaction.create<Notification>({
                    data: notificationInsert,
                    pool: connection,
                    table: NotificationModel.getTable,
                  }),
                ]);

                resolve(true);
              } catch (error) {
                await connection.rollback();
                reject(error);
              }
            })
        )
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return response.results.length;
  };

  static confirmBooking = async (socketIO: SocketServer, bookingId: string) => {
    const response = await BookingService.findOne({
      id: bookingId,
      deleted_at: isNull(),
    });

    if (!response) return 0;

    const status = ["pending_payment", "pending_confirmation"];

    if (!status.includes(response.status)) return 0;

    const transaction = new Transaction();

    const connection = await transaction.getPoolTransaction();

    try {
      const saveTokenExpo = await SaveExpoPushTokenService.findOne({
        actor_type: "customer",
        user_id: response.customer_id,
      });

      const notificationInsert: Notification = {
        actor_type: "customer",
        body: `Xác nhận phòng thành công lúc ${dayjs().format(
          "DD/MM/YYYY HH:mm:ss"
        )}. Mã đặt phòng là ${response.id}`,
        entity_id: response.id!,
        entity_name: BookingModel.getTable,
        title: "Xác nhận thành công",
        user_id: response.customer_id,
        notification_type: NotificationTypes.CONFIRM_SUCCESS,
      };

      socketIO
        .to(`${response.customer_id}`)
        .emit(SocketEventsName.NOTIFICATION, notificationInsert);

      if (saveTokenExpo) {
        const expo = new ExpoServerSDK();
        await expo.pushToken({
          to: saveTokenExpo.expo_push_token!,
          body: notificationInsert.body,
          title: notificationInsert.title,
          sound: "default",
        });
      }

      await Promise.all([
        transaction.update<Partial<Booking>, Booking>({
          data: { status: "confirmed" },
          key: "id",
          pool: connection,
          table: BookingModel.getTable,
          valueOfKey: response.id!,
        }),
        transaction.update<Partial<BookingDetail>, BookingDetail>({
          data: { status: "confirmed" },
          key: "booking_id",
          pool: connection,
          table: BookingDetailModel.getTable,
          valueOfKey: response.id!,
        }),
        transaction.create<Notification>({
          data: notificationInsert,
          pool: connection,
          table: NotificationModel.getTable,
        }),
      ]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return 1;
  };

  static deleteBookingAfter3Hour = async (socketIO: SocketServer, bookingId: string) => {
    const response = await BookingService.findOne({
      id: bookingId,
      deleted_at: isNull(),
      status: "pending_payment",
    });

    if (!response) return 0;

    const transaction = new Transaction();

    const connection = await transaction.getPoolTransaction();

    try {
      const saveTokenExpo = await SaveExpoPushTokenService.findOne({
        actor_type: "customer",
        user_id: response.customer_id,
      });

      const notificationInsert: Notification = {
        actor_type: "customer",
        body: `Đặt phòng ${response.id} của bạn đã bị xóa.`,
        entity_id: response.id!,
        entity_name: BookingModel.getTable,
        title: "Xóa đặt phòng",
        user_id: response.customer_id,
        notification_type: NotificationTypes.DELETE_AFTER_3_HOUR,
      };

      socketIO
        .to(`${response.customer_id}`)
        .emit(SocketEventsName.NOTIFICATION, notificationInsert);

      if (saveTokenExpo) {
        const expo = new ExpoServerSDK();
        await expo.pushToken({
          to: saveTokenExpo.expo_push_token!,
          body: notificationInsert.body,
          title: notificationInsert.title,
          sound: "default",
        });
      }

      await Promise.all([
        transaction.update<Partial<Booking>, Booking>({
          data: { deleted_at: dateTimeSql() },
          key: "id",
          pool: connection,
          table: BookingModel.getTable,
          valueOfKey: response.id!,
        }),
        transaction.update<Partial<BookingDetail>, BookingDetail>({
          data: { deleted_at: dateTimeSql() },
          key: "booking_id",
          pool: connection,
          table: BookingDetailModel.getTable,
          valueOfKey: response.id!,
        }),
        transaction.create<Notification>({
          data: notificationInsert,
          pool: connection,
          table: NotificationModel.getTable,
        }),
      ]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return 1;
  };

  static checkExpiresCheckInOut = async () => {
    const { results } = await BookingDetailService.getAll(
      {
        status: raw(`NOT IN ('canceled', 'checked_out', 'completed', 'in_progress')`),
        deleted_at: isNull(),
      },
      { limit: 9999 }
    );

    if (!results.length) return;

    await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const checkIn = dayjs(row.check_in);
              const checkOut = dayjs(row.check_out);
              const current = dayjs();

              const compareCheckIn = current.diff(checkIn, "minutes", true);
              const compareCheckOut = current.diff(checkOut, "minutes", true);

              if (compareCheckIn < 0 || compareCheckOut < 0) return resolve(true);

              // console.log("====================================");
              // console.log({ compareCheckIn, compareCheckOut });
              // console.log("====================================");

              await Promise.all([
                BookingModel.update<Partial<Booking>, Booking>(
                  { status: "canceled" },
                  row.booking_id,
                  "id"
                ),
                BookingDetailModel.update<Partial<BookingDetail>, BookingDetail>(
                  { status: "canceled" },
                  row.id,
                  "id"
                ),
              ]);

              resolve(true);
            } catch (error) {
              reject(error);
            }
          })
      )
    );
  };

  static paymentBooking = async (bookingId: PaymentBookingInput["bookingId"]) => {
    const booking = await BookingService.findOne({
      deleted_at: isNull(),
      id: bookingId,
      status: raw(`IN ('pending_payment', 'pending_confirmation')`),
    });

    if (!booking) {
      throw new NotFoundRequestError(`Đặt phòng của bạn không tìm thấy hoặc đã bị xóa.`);
    }

    // TODO: payment online

    const response = await ZaloPayService.requestPayment({
      amount: booking.total_price,
      appUser: bookingId,
      description: "Thanh toán đặt phòng",
      extraData: { type: encodeBase64("booking") },
      title: "Thanh toán đặt phòng",
      bookingId: bookingId,
      isBooking: false,
    });

    return response;
  };

  static paymentFailed = async (bookingId: string) => {
    await Promise.all([
      ZaloPayTransactionModel.update<Partial<ZaloPayTransaction>, ZaloPayTransaction>(
        { status: "failed" },
        bookingId,
        "booking_id"
      ),
      BookingModel.update<Partial<Booking>, Booking>(
        { status: "pending_payment" },
        bookingId,
        "id"
      ),
    ]);

    return true;
  };

  static cancelBooking = async (bookingId: string) => {
    await Promise.all([
      BookingModel.update<Partial<Booking>, Booking>({ status: "canceled" }, bookingId, "id"),
      BookingDetailModel.update<Partial<BookingDetail>, BookingDetail>(
        { status: "canceled" },
        bookingId,
        "booking_id"
      ),
    ]);

    return true;
  };
}

export default BookingService;
