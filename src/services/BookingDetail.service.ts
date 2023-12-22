import { Bill, BookingDetail, BookingDetailModel, Rate } from "@/models";
import { BookingDetailInputCreate, BookingDetailInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, getInfoData, isNull } from "@/utils";
import { ObjectType, Pagination } from "types";
import BookingService from "./Booking.service";
import RoomService from "./Room.service";
import BillService from "./Bill.service";
import RateService from "./Rate.service";

type ResponseGetAll = BookingDetail & {
  rooms: Omit<Awaited<typeof RoomService.getById>, "room_numbers">;
  bill: Bill | null;
};

class BookingDetailService {
  static create = async (data: BookingDetailInputCreate) => {
    const bookings = [
      { booking_id: "01112023120000", room_id: 1 },
      { booking_id: "02112023120000", room_id: 1 },
      { booking_id: "03112023120000", room_id: 3 },
      { booking_id: "04112023120000", room_id: 4 },
      { booking_id: "05112023120000", room_id: 4 },
      { booking_id: "Mo102023120000", room_id: 4 },
      { booking_id: "Su102023120000", room_id: 5 },
      { booking_id: "Tu102023120000", room_id: 5 },
      { booking_id: "We102023120000", room_id: 4 },
    ];

    const insertBulks = bookings.map((b) => [
      b.booking_id,
      b.room_id,
      null,
      null,
      null,
      null,
      null,
    ]);

    // @ts-ignore
    await BookingDetailModel.createBulk(insertBulks);

    const all = await BookingDetailModel.findAll();

    return all;
  };

  static update = async (data: BookingDetailInputUpdate["body"], id: number) => {
    let BookingDetail: BookingDetail | boolean;

    if (!(await BookingDetailModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await BookingDetailModel.findOne<BookingDetail>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(
        `Đã có lỗi xảy ra khi tìm dữ liêu bookingDetails. Không tìm thấy id = ${id}`
      );
    }

    const booking = await BookingService.getById(data.booking_id);

    return {
      ...data,
      bookingData: getInfoData(booking, [
        "id",
        "customerData",
        "is_booked_online",
        "mode_booking",
        "payment",
        "total_price",
        "total_room",
      ]),
    };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    filters = { deleted_at: isNull(), ...filters };

    const results = await BookingDetailModel.findAll<BookingDetail>(filters, undefined, options);

    const total = await BookingDetailModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<ResponseGetAll> =>
          new Promise(async (resolve, reject) => {
            try {
              const rooms = await RoomService.getById(row.room_id);
              const bill = await BillService.findOne({ booking_details_id: row.id });

              const { room_numbers, ...others } = rooms;

              resolve({ ...row, rooms: others, bill: bill || null });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<BookingDetail>) => {
    return await BookingDetailModel.findOne<BookingDetail>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await BookingDetailModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default BookingDetailService;
