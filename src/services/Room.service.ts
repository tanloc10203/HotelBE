import { ExpoServerSDK } from "@/helpers";
import { Transaction, removeImageV2, resultUrlImage } from "@/lib";
import {
  Bed,
  BedModel,
  Bill,
  BillModel,
  Booking,
  BookingDetail,
  BookingDetailModel,
  BookingModel,
  BookingStatus,
  Discount,
  DurationsRoom,
  DurationsRoomModel,
  GuestStayInformation,
  GuestStayInformationModel,
  ModeBookingType,
  Notification,
  NotificationModel,
  NotificationTypes,
  Room,
  RoomModel,
  RoomNumber,
  RoomNumberModel,
  RoomPrice,
  RoomPriceModel,
  TaxModel,
} from "@/models";
import {
  ChangeRoomInput,
  CheckInInput,
  CheckoutInput,
  DiscountRoomCreateInput,
  GetChangeRoomsQuery,
  GetFrontDeskQuery,
  GetInfoInProgressParams,
  GuestStayInformationInputCreate,
  RoomInputCreate,
  RoomInputUpdate,
  SearchingRoomAvailableInput,
} from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  InternalServerRequestError,
  NotFoundRequestError,
  dateFormatSql,
  dateTimeSql,
  generateUUID,
  isNotNull,
  isNull,
} from "@/utils";
import dayjs from "dayjs";
import { ObjectType, Pagination } from "types";
import BedService from "./Bed.service";
import BillService from "./Bill.service";
import BookingService from "./Booking.service";
import BookingDetailService from "./BookingDetail.service";
import CustomerService from "./Customer.service";
import DiscountService from "./Discount.service";
import DurationsRoomService from "./DurationsRoom.service";
import FloorService from "./Floor.service";
import GuestStayInformationService from "./GuestStayInformation.service";
import RoomNumberService from "./RoomNumber.service";
import RoomTypeService from "./RoomType.service";
import SaveExpoPushTokenService from "./SaveExpoPushToken.service";

type ResponseType = {
  room_numbers: RoomNumber[];
  roomType: Awaited<ReturnType<typeof RoomTypeService.getById>>;
  floor: Awaited<ReturnType<typeof FloorService.getById>>;
  discount: Awaited<ReturnType<typeof DiscountService.getByRoomId>>;
  durationRoom: Awaited<ReturnType<typeof DurationsRoomService.findOne>>;
  beds: Awaited<ReturnType<typeof BedService.getByRoomId>>;
} & Room;

export type GetCustomerBookedPayload = {
  checkIn: string;
  checkOut: string;
  modeBooking: ModeBookingType;
  roomNumber: string;
  customerId?: number;
  bookingDetailsId?: string;
  status: BookingStatus;
};

type ResponseSearchRoomAvailableDesktop = {
  roomTypeId: number;
  name: string;
  desc?: string;
  character: string;
  roomId: number;
  prices: RoomPrice | null;
  maxPeople: {
    adults: number;
    children: number;
  };
  roomAvailable: number;
  roomNumbers: RoomNumber[];
  discount: Discount | null;
};

type ResponseGetBooked = Awaited<ReturnType<typeof BookingModel.getBookedByCustomer>>;

type OptionsGetRoomId = {
  isDeletedRoomNumberIsNull: boolean;
};

class RoomService {
  static create = async (data: RoomInputCreate & { photo_publish: string }) => {
    const {
      adults,
      area,
      children,
      beds,
      check_in_from,
      check_in_to,
      check_out_to,
      check_out_from,
      room_numbers,
      ...others
    } = data;

    const roomNumberExist = await RoomService.findOne({
      room_type_id: others.room_type_id,
      floor_id: others.floor_id,
    });

    if (roomNumberExist) {
      throw new ConflictRequestError(
        `Loại phòng \`${others.room_type_id}\` và vị trì phòng \`${others.floor_id}\` đã tồn tại.`
      );
    }

    const transaction = new Transaction();

    const connection = await transaction.getPoolTransaction();

    try {
      const createdRoom = await transaction.create<Room>({
        data: {
          adults: adults,
          area: area ?? null,
          children: children ?? null,
          ...others,
        } as any,
        pool: connection,
        table: RoomModel.getTable,
      });

      // @ts-ignore
      const bedsInsert = beds.map((b) => [b.value, createdRoom, b.quantity, null]);

      // @ts-ignore
      const roomNumbersInsert = room_numbers.map((r) => [
        r.id,
        createdRoom,
        r.note,
        r.status,
        null,
      ]);

      await Promise.all([
        transaction.createBulk({
          pool: connection,
          table: BedModel.getTable,
          fillables: BedModel.getFillables,
          data: bedsInsert,
        }),
        transaction.createBulk({
          pool: connection,
          table: RoomNumberModel.getTable,
          fillables: RoomNumberModel.getFillables,
          data: roomNumbersInsert,
          withId: true,
        }),
        transaction.create<DurationsRoom>({
          data: {
            check_in_from,
            check_in_to,
            check_out_to,
            room_id: createdRoom,
            check_out_from,
          },
          pool: connection,
          table: DurationsRoomModel.getTable,
        }),
      ]);

      return createdRoom;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static update = async (
    data: RoomInputUpdate["body"] & { photo_publish?: string },
    id: number
  ) => {
    let {
      adults,
      area,
      children,
      beds,
      check_in_from,
      check_in_to,
      check_out_to,
      check_out_from,

      room_numbers,
      ...others
    } = data;

    let roomNumberExist = await RoomService.findOne({
      room_type_id: others.room_type_id,
      floor_id: others.floor_id,
    });

    if (roomNumberExist && roomNumberExist.id !== id) {
      throw new ConflictRequestError(
        `Loại phòng \`${others.room_type_id}\` và vị trì phòng \`${others.floor_id}\` đã tồn tại.`
      );
    }

    const transaction = new Transaction();

    const [connection, room] = await Promise.all([
      transaction.getPoolTransaction(),
      RoomService.getById(id, { isDeletedRoomNumberIsNull: false }),
    ]);

    const roomNumberIsRead = room.room_numbers.filter((t) => t.deleted_at === null);
    const roomNumberIsDeleted = room.room_numbers.filter((t) => t.deleted_at !== null);

    let roomNumberNew: RoomNumber[] = [];
    let roomNumberDelete: RoomNumber[] = [];
    let roomNumberUpdate: RoomNumber[] = [];

    if (room_numbers.length) {
      // @ts-ignore
      roomNumberNew = room_numbers.filter((t) => !roomNumberIsRead.map((t) => t.id).includes(t.id));

      roomNumberDelete = roomNumberIsRead.filter(
        // @ts-ignore
        (t) => !room_numbers.map((t) => t.id).includes(t.id)
      );

      if (roomNumberNew.length > 0) {
        const tempRoomNumberIsDeleted = roomNumberIsDeleted.map((t) => t.id);

        roomNumberUpdate = roomNumberNew.filter((t) => tempRoomNumberIsDeleted.includes(t.id));

        roomNumberNew = roomNumberNew.filter((t) => !tempRoomNumberIsDeleted.includes(t.id));
      }
    }

    if (roomNumberNew.length) {
      await Promise.all(
        roomNumberNew.map(
          (rNNew) =>
            new Promise(async (resolve, reject) => {
              try {
                const rnExists = await RoomNumberService.findOne({ id: rNNew.id! });

                if (rnExists) {
                  throw new ConflictRequestError(`Số phòng \`${rNNew.id}\` đã tồn tại`);
                }

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        )
      );
    }

    // console.log("====================================");
    // console.log({
    //   roomNumberIsRead,
    //   roomNumberIsDeleted,
    //   roomNumberNew,
    //   roomNumberDelete,
    //   roomNumberUpdate,
    // });
    // console.log("====================================");

    // throw Error("Maintain system");

    try {
      if (room.durationRoom) {
        await transaction.update<Partial<DurationsRoom>, Partial<DurationsRoom>>({
          data: { check_in_from, check_in_to, check_out_to, room_id: id!, check_out_from },
          key: "id",
          valueOfKey: (room.durationRoom as DurationsRoom).id!,
          pool: connection,
          table: DurationsRoomModel.getTable,
        });
      } else {
        await transaction.create<DurationsRoom>({
          data: {
            check_in_from,
            check_in_to,
            check_out_to,
            room_id: id!,
            check_out_from,
          },
          pool: connection,
          table: DurationsRoomModel.getTable,
        });
      }

      if (room?.beds?.length) {
        await Promise.all(
          room.beds.map(
            (r) =>
              new Promise(async (resolve, reject) => {
                try {
                  await transaction.delete<Bed>({
                    conditions: { bed_id: r.bed_id },
                    pool: connection,
                    table: BedModel.getTable,
                  });

                  resolve(true);
                } catch (error) {
                  reject(error);
                }
              })
          )
        );
      }

      // @ts-ignore
      const bedsInsert = beds.map((b) => [b.value, id!, b.quantity, null]);

      if (others?.photo_publish) {
        if (room.photo_publish) {
          await removeImageV2(room.photo_publish);
        }
      } else {
        delete others.photo_publish;
      }

      const roomNumbersInsert = roomNumberNew.map((r) => [r.id, id, r.note, r.status, null]);

      const [updated] = await Promise.all([
        transaction.update({
          data: {
            adults: adults,
            area: area ?? null,
            children: children ?? null,
            ...others,
          },
          key: "id",
          pool: connection,
          table: RoomModel.getTable,
          valueOfKey: id,
        }),
        transaction.createBulk({
          pool: connection,
          table: BedModel.getTable,
          fillables: BedModel.getFillables,
          data: bedsInsert,
        }),
        roomNumbersInsert.length
          ? transaction.createBulk({
              pool: connection,
              table: RoomNumberModel.getTable,
              fillables: RoomNumberModel.getFillables,
              data: roomNumbersInsert,
              withId: true,
            })
          : null,

        ...(roomNumberDelete.length
          ? roomNumberDelete.map(
              (rnDelete) =>
                new Promise(async (resolve, reject) => {
                  try {
                    await transaction.update<Partial<RoomNumber>, RoomNumber>({
                      data: { deleted_at: dateTimeSql() },
                      key: "id",
                      pool: connection,
                      table: RoomNumberModel.getTable,
                      valueOfKey: rnDelete.id!,
                    });

                    resolve(true);
                  } catch (error) {
                    reject(error);
                  }
                })
            )
          : []),
        ...(roomNumberUpdate.length
          ? roomNumberUpdate.map(
              (rNUpdate) =>
                new Promise(async (resolve, reject) => {
                  try {
                    await transaction.update<Partial<RoomNumber>, RoomNumber>({
                      data: { deleted_at: null },
                      key: "id",
                      pool: connection,
                      table: RoomNumberModel.getTable,
                      valueOfKey: rNUpdate.id!,
                    });

                    resolve(true);
                  } catch (error) {
                    reject(error);
                  }
                })
            )
          : []),
      ]);

      if (!updated) {
        throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return true;
  };

  static getById = async (id: number, options?: OptionsGetRoomId) => {
    const data = await RoomModel.findOne<Room>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const [roomType, floor, discount, durationRoom, beds, roomNumbers] = await Promise.all([
      RoomTypeService.getById(data.room_type_id),
      FloorService.getById(data.floor_id),
      DiscountService.getByRoomId(id),
      DurationsRoomService.findOne({ room_id: data.id }),
      BedService.getByRoomId(data.id!),
      RoomNumberService.getByRoomId(data.id!, options?.isDeletedRoomNumberIsNull),
    ]);

    return {
      ...data,
      photo_publish: data.photo_publish ? resultUrlImage(data.photo_publish) : "",
      room_numbers: roomNumbers,
      roomType,
      floor,
      discount,
      durationRoom,
      beds,
    };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    filters = { deleted_at: isNull(), ...filters };

    const results = await RoomModel.findAll<Room>(filters, undefined, options);

    const total = await RoomModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<ResponseType> =>
          new Promise(async (resolve, reject) => {
            try {
              const roomType = await RoomTypeService.getById(row.room_type_id);
              const floor = await FloorService.getById(row.floor_id);
              const discount = await DiscountService.getByRoomId(row.id!);
              const durationRoom = await DurationsRoomService.findOne({ room_id: row.id });
              const beds = await BedService.getByRoomId(row.id!);
              const roomNumbers = await RoomNumberService.getByRoomId(row.id!);

              resolve({
                ...row,
                photo_publish: row.photo_publish ? resultUrlImage(row.photo_publish) : "",
                room_numbers: roomNumbers,
                roomType,
                floor,
                discount,
                durationRoom,
                beds,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Room>, select?: keyof Room) => {
    return await RoomModel.findOne<Room>({ deleted_at: isNull(), ...conditions }, select);
  };

  static deleteById = async (id: number) => {
    const updated = await RoomModel.update<Partial<Room>, Room>({ deleted_at: dateTimeSql() }, id);

    if (!updated) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static trash = async () => {
    const data = await RoomService.getAll({ deleted_at: isNotNull() }, { limit: 5, page: 1 });
    return data;
  };

  static getListPrices = async (roomId: number) => {
    const listPrices = await RoomPriceModel.findAll({ room_id: roomId }, undefined, {
      order: "created_at",
    });
    return listPrices;
  };

  /**
   * @description check id exist ? IF true => update else => create
   * @param data
   */
  static addDiscount = async (data: DiscountRoomCreateInput) => {
    const { id, ...others } = data;

    if (!id) {
      const created = await DiscountService.create(others);
      return created;
    }

    await DiscountService.update(others, id);

    return id;
  };

  static searchingRoomAvailable = async ({
    check_in,
    check_out,
    room_id,
  }: SearchingRoomAvailableInput) => {
    const [isBooked, room] = await Promise.all([
      RoomModel.callProd("sp_searching_room_is_booked_timespan", [
        dateTimeSql(check_in),
        dateTimeSql(check_out),
        room_id!,
      ]),
      RoomService.findOne({ id: room_id }, "room_quantity"),
    ]);

    if (!room) return 0;

    const roomAvailable = room.room_quantity - isBooked.length;
    const result = roomAvailable < 0 ? 0 : roomAvailable;

    return result;
  };

  static getForFrontDesk = async () => {
    const floor = await FloorService.getAll({}, { limit: 9999, page: 1 });

    if (!floor.results.length) return [];

    const currentDate = dayjs();
    const nextDate = currentDate.add(1, "day");
    const startDate = currentDate.format("YYYY-MM-DD HH:mm:ss");
    const endDate = nextDate.format("YYYY-MM-DD HH:mm:ss");

    const results = await Promise.all(
      floor.results.map(
        (t) =>
          new Promise(async (resolve, reject) => {
            try {
              const room = await RoomModel.findAll<Room>({ floor_id: t.id });

              if (!room.length) return resolve({ ...t, rooms: [] });

              const roomNumbers = await Promise.all(
                room.map(
                  (r) =>
                    new Promise(async (resolve, reject) => {
                      try {
                        let [roomType, roomNumbers, roomNumbersInProgress, roomNumbersCheckedOut] =
                          await Promise.all([
                            RoomTypeService.getById(r.room_type_id),
                            RoomNumberService.getByRoomId(r.id!),
                            BookingModel.getRoomNumberIsBooked({
                              checkIn: startDate,
                              checkOut: endDate,
                              roomId: r.id!,
                              status: "in_progress",
                            }),
                            BookingModel.getRoomNumberIsBooked({
                              checkIn: startDate,
                              checkOut: endDate,
                              roomId: r.id!,
                              status: "checked_out",
                            }),
                          ]);

                        const roomNumbersInProgressIds = roomNumbersInProgress.map((v) => v.id!);
                        const roomNumbersCheckedOutIds = roomNumbersCheckedOut.map((v) => v.id!);

                        const _roomNumbers = await Promise.all(
                          roomNumbers.map(
                            (r) =>
                              new Promise(async (resolve, reject) => {
                                try {
                                  if (roomNumbersCheckedOutIds.includes(r.id!)) {
                                    const checkedOut = roomNumbersCheckedOut.find(
                                      (r) => r.id === r.id
                                    )!;

                                    const { results } = await GuestStayInformationService.getAll(
                                      { booking_details_id: checkedOut.booking_detail_id },
                                      {}
                                    );

                                    const bill = await BillService.findOne({
                                      booking_details_id: checkedOut.booking_detail_id,
                                    });

                                    return resolve({
                                      ...r,
                                      updated_at: checkedOut.updated_at_bd,
                                      booking_id: checkedOut.booking_id,
                                      checked_in: checkedOut.checked_in,
                                      booking_detail_id: checkedOut.booking_detail_id,
                                      check_in: checkedOut.check_in,
                                      check_out: checkedOut.check_out,
                                      mode_booking: checkedOut.mode_booking,
                                      bill: bill ? bill : null,
                                      guestInformations: results,
                                      status: "cleanup",
                                      adults: checkedOut.adults,
                                      children: checkedOut.children,
                                    });
                                  }

                                  if (roomNumbersInProgressIds.includes(r.id!)) {
                                    const inProgress = roomNumbersInProgress.find(
                                      (r) => r.id === r.id
                                    )!;

                                    const { results } = await GuestStayInformationService.getAll(
                                      { booking_details_id: inProgress.booking_detail_id },
                                      {}
                                    );

                                    const bill = await BillService.findOne({
                                      booking_details_id: inProgress.booking_detail_id,
                                    });

                                    return resolve({
                                      ...r,
                                      updated_at: inProgress.updated_at_bd,
                                      checked_in: inProgress.checked_in,
                                      booking_id: inProgress.booking_id,
                                      booking_detail_id: inProgress.booking_detail_id,
                                      check_in: inProgress.check_in,
                                      check_out: inProgress.check_out,
                                      mode_booking: inProgress.mode_booking,
                                      bill: bill ? bill : null,
                                      guestInformations: results,
                                      status: "unavailable",
                                      adults: inProgress.adults,
                                      children: inProgress.children,
                                    });
                                  }

                                  resolve({
                                    ...r,
                                    booking_id: null,
                                    booking_detail_id: null,
                                    bill: null,
                                    guestInformations: [],
                                    check_in: null,
                                    check_out: null,
                                    mode_booking: null,
                                    adults: 0,
                                    children: 0,
                                  });
                                } catch (error) {
                                  reject(error);
                                }
                              })
                          )
                        );

                        const { amenities, images, equipments, ...rtR } = roomType;

                        resolve({
                          ...r,
                          discount: roomType.discount,
                          photo_publish: r.photo_publish ? resultUrlImage(r.photo_publish) : "",
                          roomType: rtR,
                          room_numbers: _roomNumbers,
                        });
                      } catch (error) {
                        reject(error);
                      }
                    })
                )
              );

              resolve({ ...t, rooms: roomNumbers });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static getForFrontDeskTimeline = async (params: GetFrontDeskQuery) => {
    const floor = await FloorService.getAll({}, { limit: 9999, page: 1 });

    if (!floor.results.length) return [];

    const currentDate = dayjs(params?.startDate);
    const nextDate = params?.endDate ? dayjs(params.endDate) : currentDate.add(1, "day");
    const startDate = currentDate.format("YYYY-MM-DD HH:mm:ss");
    const endDate = nextDate.format("YYYY-MM-DD 23:59:59");

    const bookingDetails = await BookingDetailModel.getBookingDetailsByDates({
      end: endDate,
      start: startDate,
    });

    console.log("====================================");
    console.log(`bookingDetails`, {
      bookingDetails,
      startDate,
      endDate,
      nextDate,
      currentDate: currentDate.format("DD-MM-YYYY HH:mm:ss"),
    });
    console.log("====================================");

    const results = await Promise.all(
      floor.results.map(
        (t) =>
          new Promise(async (resolve, reject) => {
            try {
              const room = await RoomModel.findAll<Room>({ floor_id: t.id });

              if (!room.length) return resolve({ ...t, rooms: [] });

              const roomNumbers = await Promise.all(
                room.map(
                  (r) =>
                    new Promise(async (resolve, reject) => {
                      try {
                        let [roomType, roomNumbers] = await Promise.all([
                          RoomTypeService.getById(r.room_type_id),
                          RoomNumberService.getByRoomId(r.id!),
                        ]);

                        const { amenities, images, equipments, ...rtR } = roomType;

                        const _roomNumbers = roomNumbers.map((r) => ({
                          ...r,
                          bookings: bookingDetails.filter((t) => t.room_number_id === r.id),
                        }));

                        resolve({
                          ...r,
                          photo_publish: r.photo_publish ? resultUrlImage(r.photo_publish) : "",
                          roomType: rtR,
                          room_numbers: _roomNumbers,
                        });
                      } catch (error) {
                        reject(error);
                      }
                    })
                )
              );

              resolve({ ...t, rooms: roomNumbers });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static searchingRoomAvailableDesktop = async ({
    check_in,
    check_out,
  }: Omit<SearchingRoomAvailableInput, "room_id">) => {
    const rooms = await RoomService.getAll({}, {});

    const results = await Promise.all(
      rooms.results.map(
        (value): Promise<ResponseSearchRoomAvailableDesktop> =>
          new Promise(async (resolve, reject) => {
            try {
              const roomTypes = await RoomTypeService.getById(value.room_type_id);

              const { name, desc, character } = roomTypes;
              const { roomType, adults, children } = value;

              const roomNumber = await RoomModel.getRoomNumberAvailability({
                checkIn: check_in,
                checkOut: check_out,
                roomId: value.id!,
              });

              resolve({
                roomTypeId: value.room_type_id!,
                name,
                desc,
                character,
                roomId: value.id!,
                prices: roomTypes.prices || null,
                maxPeople: { adults, children: children ?? 0 },
                roomAvailable: roomNumber.length,
                roomNumbers: roomNumber,
                discount: roomTypes.discount || null,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static getCustomerByRoomNumber = async ({
    checkIn,
    checkOut,
    modeBooking,
    roomNumber,
    customerId,
    bookingDetailsId,
    status,
  }: GetCustomerBookedPayload) => {
    let response: ResponseGetBooked = [];

    if (customerId) {
      response = await BookingModel.getBookedByCustomer({
        checkIn,
        checkOut,
        customerId,
        status,
      });
    } else {
      response = await BookingModel.getCustomerRoomNumberIsBooked({
        checkIn,
        checkOut,
        modeBooking,
        roomNumber,
        status,
      });
    }

    if (bookingDetailsId) {
      response = response.filter((r) => r.id === bookingDetailsId);
    }

    const results = await Promise.all(
      response.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const [room, guestInformations, { results: rsD }, bill, tax] = await Promise.all([
                RoomService.getById(row.room_id),
                GuestStayInformationService.getAll({ booking_details_id: row.id }, {}),
                DiscountService.getAll({ id: row.discount_id }, {}),
                BillService.findOne({ booking_details_id: row.id }),
                TaxModel.getTaxVAT(),
              ]);

              const discount = rsD[0];

              resolve({
                ...row,
                prices: room.roomType.prices,
                roomTypeName: room.roomType.name,
                guestInformations: guestInformations.results,
                bill: bill || null,
                discount,
                tax,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static checkIn = async (payload: CheckInInput) => {
    // throw new InternalServerRequestError(`Maintain system`);

    const { bookingDetails, booking_id, customer_id, is_booked_online, employee_id, modeBooking } =
      payload;

    const [customer, saveExpoPushToken, booking, taxResults] = await Promise.all([
      CustomerService.getById(customer_id),
      SaveExpoPushTokenService.findOne({ user_id: customer_id }),
      BookingService.getById(booking_id),
      TaxModel.getTaxVAT(),
    ]);

    const statuses = ["pending_payment", "pending_confirmation"];

    if (booking.is_booked_online && statuses.includes(booking.status)) {
      throw new BadRequestError(`Khách hàng chưa thanh toán`);
    }

    const notification: Notification = {
      actor_type: "employee",
      body: `Khách hàng ${customer.display_name} đã nhận phòng. Mã đặt phòng \`${booking_id}\``,
      entity_id: `${booking_id}`,
      entity_name: BookingModel.getTable,
      title: "Khách hàng nhận phòng thành công",
      user_id: employee_id,
      notification_type: NotificationTypes.CHECK_IN_SUCCESS,
      is_system: 1,
    };

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.create<Notification>({
          data: notification,
          pool: connection,
          table: NotificationModel.getTable,
        }),
        ...bookingDetails.map(
          (row) =>
            new Promise(async (resolve, reject) => {
              try {
                const [details, bill] = await Promise.all([
                  BookingDetailService.getById(row.id),
                  BillService.findOne({ booking_details_id: row.id }),
                ]);

                if (!bill) {
                  throw new NotFoundRequestError(`Không tìm thấy thông tin hóa đơn`);
                }

                let discount: Discount | null = null;

                if (details.discount_id) {
                  discount = await DiscountService.getById(details.discount_id);
                }

                const durationCheckIn = BookingModel.checkInLate(row.check_in);
                let priceCheckInLate = 0;

                if (durationCheckIn.late) {
                  priceCheckInLate = BookingModel.calcPriceCheckInLate(
                    durationCheckIn,
                    discount,
                    row.prices as RoomPrice,
                    taxResults
                  );
                }

                console.log("====================================");
                console.log(`priceCheckInLate`, { priceCheckInLate, bill });
                console.log("====================================");

                // throw new InternalServerRequestError(`Maintain system`);

                await Promise.all([
                  durationCheckIn.late && priceCheckInLate > 0
                    ? transaction.update<Partial<Bill>, Bill>({
                        data: {
                          cost_last_checkin: priceCheckInLate,
                          // total_price: Number(bill.total_price) + priceCheckInLate,
                        },
                        key: "id",
                        pool: connection,
                        table: BillModel.getTable,
                        valueOfKey: bill.id!,
                      })
                    : null,

                  transaction.update<Partial<BookingDetail>, Partial<BookingDetail>>({
                    data: {
                      status: "in_progress",
                      checked_in: dateTimeSql(),
                    },
                    key: "id",
                    pool: connection,
                    table: BookingDetailModel.getTable,
                    valueOfKey: row.id,
                  }),

                  transaction.update<Partial<Booking>, Partial<Booking>>({
                    data: {
                      status: "in_progress",
                    },
                    key: "id",
                    pool: connection,
                    table: BookingModel.getTable,
                    valueOfKey: details.booking_id,
                  }),
                ]);

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        ),
      ]);

      if (saveExpoPushToken) {
        const expo = new ExpoServerSDK();

        await expo.pushToken({
          to: saveExpoPushToken.expo_push_token!,
          body: notification.body,
          title: notification.title,
          sound: "default",
        });
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return true;
  };

  static addGuestStayInformation = async (payload: GuestStayInformationInputCreate) => {
    const { filters, ...dataGuest } = payload;

    const identity = await GuestStayInformationService.findOne({
      room_number: dataGuest.room_number,
      booking_details_id: dataGuest.booking_details_id,
      identification_type: dataGuest.identification_type,
      identification_value: dataGuest.identification_value,
    });

    if (identity) {
      throw new ConflictRequestError(
        `Số giấy tờ \`${dataGuest.identification_value}\` đã  bị trùng`
      );
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await transaction.create<GuestStayInformation>({
        data: {
          ...dataGuest,
          birthday: dataGuest.birthday ? dateFormatSql(dataGuest.birthday) : null,
          id: generateUUID("GID"),
        },
        pool: connection,
        table: GuestStayInformationModel.getTable,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    if (filters) {
      const response = await RoomService.getCustomerByRoomNumber(filters);
      return response;
    }

    // const response =  await Room

    return true;
  };

  static getInformationRoomByBookingDetailsId = async (bookingDetailsId: string) => {
    const [bookingDetails, bill, guestsData, tax] = await Promise.all([
      BookingDetailService.getById(bookingDetailsId),
      BillService.findOne({ booking_details_id: bookingDetailsId }),
      GuestStayInformationService.getAll(
        { booking_details_id: bookingDetailsId },
        { order: "created_at" }
      ),
      TaxModel.getTaxVAT(),
    ]);

    const { room_numbers, ...others } = await RoomService.getById(bookingDetails.room_id);
    const { roomType, discount } = others;
    const { name, prices } = roomType;
    const roomNumber = room_numbers.find((t) => t.id === bookingDetails.room_number_id);

    return {
      room: {
        roomNumber: roomNumber!,
        roomTypeName: name,
        prices,
        discount,
      },
      bill: bill || null,
      guestsData: guestsData.results,
      bookingDetails,
      tax,
    };
  };

  static checkout = async (data: CheckoutInput) => {
    const {
      bookingDetailsId,
      totalCostRoom,
      totalCostService,
      discount,
      change,
      customerPay,
      employeeId,
      note,
      deposit,
      billId,
      costLateCheckIn,
      costOverCheckOut,
      customerRequirePay,
      paymentCost,
      totalQuantityOrdered,
    } = data;

    const totalPrice = customerRequirePay;

    const [bookingDetails, billDataOld] = await Promise.all([
      BookingDetailService.getById(bookingDetailsId),
      BillService.getById(billId),
    ]);

    console.log("====================================");
    console.log({ data, totalPrice, bookingDetails, billDataOld });
    console.log("====================================");

    // throw new InternalServerRequestError(`Maintain system`);

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.update<Partial<BookingDetail>, Partial<BookingDetail>>({
          data: { status: "checked_out", checked_out: dateTimeSql() },
          key: "id",
          pool: connection,
          table: BookingDetailModel.getTable,
          valueOfKey: bookingDetailsId,
        }),
        transaction.update<Partial<Booking>, Partial<Booking>>({
          data: { status: "completed" },
          key: "id",
          pool: connection,
          table: BookingModel.getTable,
          valueOfKey: bookingDetails.booking_id,
        }),
        transaction.update<Partial<Bill>, Bill>({
          data: {
            total_price: totalPrice,
            cost_over_checkout: costOverCheckOut + Number(billDataOld.cost_over_checkout),
            cost_service: Number(totalCostService),
            deposit,
            note,
            discount,
            price_received: customerPay + Number(billDataOld.price_received),
            status: "paid",
            employee_id: employeeId,
          },
          key: "id",
          pool: connection,
          table: BillModel.getTable,
          valueOfKey: billId,
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

    const response = await RoomService.getInformationRoomByBookingDetailsId(bookingDetailsId);
    return response;
  };

  static getChangeRooms = async ({ checkIn, checkOut, roomTypeId }: GetChangeRoomsQuery) => {
    const response = await RoomService.searchingRoomAvailableDesktop({
      check_in: checkIn,
      check_out: checkOut,
    });

    if (roomTypeId) {
      return [...response.filter((t) => t.roomTypeId === Number(roomTypeId))];
    }

    return response;
  };

  static changeRoom = async ({ bookingDetailsId, roomNumber }: ChangeRoomInput) => {
    const bookingDetail = await BookingDetailService.getById(bookingDetailsId);

    let lastRoomNumbers: string[] = bookingDetail.last_room_number_transfer
      ? JSON.parse(bookingDetail.last_room_number_transfer)
      : [];

    lastRoomNumbers = [...lastRoomNumbers, bookingDetail.room_number_id];

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.update<Partial<BookingDetail>, Partial<BookingDetail>>({
          data: {
            room_number_id: roomNumber,
            last_room_number_transfer: JSON.stringify(lastRoomNumbers),
            checked_in: dateTimeSql(),
          },
          key: "id",
          pool: connection,
          table: BookingDetailModel.getTable,
          valueOfKey: bookingDetailsId,
        }),
        transaction.update<Partial<GuestStayInformation>, GuestStayInformation>({
          data: {
            room_number: roomNumber,
          },
          key: "booking_details_id",
          pool: connection,
          table: GuestStayInformationModel.getTable,
          valueOfKey: bookingDetailsId,
        }),
      ]);

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static cleanupRoom = async (bookingDetailsId: string) => {
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await transaction.update<Partial<BookingDetail>, Partial<BookingDetail>>({
        data: { status: "completed" },
        key: "id",
        pool: connection,
        table: BookingDetailModel.getTable,
        valueOfKey: bookingDetailsId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return true;
  };

  static getInfoInProgress = async (
    bookingDetailsId: GetInfoInProgressParams["bookingDetailsId"]
  ) => {
    const [bookingDetails, { results: guestInformations }, bill] = await Promise.all([
      BookingDetailService.getById(bookingDetailsId),
      GuestStayInformationService.getAll({ booking_details_id: bookingDetailsId }, {}),
      BillService.findOne({
        booking_details_id: bookingDetailsId,
      }),
    ]);

    const room = await RoomService.getById(bookingDetails.room_id);

    const roomNumber = room.room_numbers.find((t) => t.id === bookingDetails.room_number_id);

    return {
      ...bookingDetails,
      guestInformations,
      bill: bill ? bill : null,
      roomNumber,
      discount: room.discount,
      prices: room.roomType.prices,
      roomType: room.roomType,
    };
  };
}

export default RoomService;
