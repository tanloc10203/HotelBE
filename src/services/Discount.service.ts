import { Discount, DiscountModel, RoomPrice, RoomType } from "@/models";
import { DiscountInputCreate, DiscountInputUpdate } from "@/schema";
import {
  BadRequestError,
  NotFoundRequestError,
  dateTimeSql,
  dateTimeSqlV2DayJS,
  generateUUIDv2,
  isNotNull,
  isNull,
  isNumber,
  removeNullObj,
} from "@/utils";
import dayjs from "dayjs";
import { ObjectType, Pagination } from "types";
import RoomTypeService from "./RoomType.service";
import RoomPriceService from "./RoomPrice.service";
import PriceByHourService from "./PriceByHour.service";

export type GetAllStateDiscount = RoomType & {
  discount?: Discount | null;
  prices?: RoomPrice & {
    price_hours: Awaited<ReturnType<typeof PriceByHourService.getAll>>["results"];
  };
};

class DiscountService {
  static create = async (data: DiscountInputCreate) => {
    const uuid = generateUUIDv2("DID");

    data = removeNullObj(data) as DiscountInputCreate;

    const time_end = dateTimeSqlV2DayJS(data.time_end);
    const time_start = dateTimeSqlV2DayJS(data.time_start);
    const price_discount = data.price_discount !== 0 ? data.price_discount : null;
    const percent_discount = data.percent_discount !== 0 ? data.percent_discount : null;

    const insert = {
      ...data,
      id: uuid,
      time_start,
      time_end,
      price_discount,
      percent_discount,
    };

    const created = await DiscountModel.create(insert);

    return created;
  };

  static update = async (data: DiscountInputUpdate["body"], id: string) => {
    data = removeNullObj(data) as DiscountInputCreate;

    const time_end = dateTimeSqlV2DayJS(data.time_end);
    const time_start = dateTimeSqlV2DayJS(data.time_start);
    const price_discount = data.price_discount !== 0 ? data.price_discount : null;
    const percent_discount = data.percent_discount !== 0 ? data.percent_discount : null;

    const updated = await DiscountModel.update(
      {
        ...data,
        time_start,
        time_end,
        price_discount: data.type === "percent" ? null : price_discount,
        percent_discount: data.type === "price" ? null : percent_discount,
      },
      id
    );

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await DiscountModel.findOne<Discount>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (
    filters: Record<string, any>,
    options: Partial<Pagination>,
    isNotCheckExpired = false
  ) => {
    filters = { deleted_at: isNull(), ...filters };
    const results = await DiscountModel.findAll<Discount>(filters, undefined, options);
    const total = await DiscountModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<GetAllStateDiscount | null> =>
          new Promise(async (resolve, reject) => {
            try {
              const [roomType, roomPrice] = await Promise.all([
                RoomTypeService.findOne({ id: row.room_type_id }),
                RoomPriceService.findOne({ room_type_id: row.room_type_id }),
              ]);

              if (!roomType || !roomPrice) {
                return resolve(null);
              }

              const { results: price_hours } = await PriceByHourService.getAll(
                { room_price_id: roomPrice.id },
                { order: "start_hour,asc" }
              );

              const discountCheckExpired = await DiscountModel.checkExpired(row);

              resolve({
                ...roomType,
                prices: {
                  ...roomPrice,
                  price_hours,
                },
                discount: isNotCheckExpired ? row : discountCheckExpired,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Discount>) => {
    const response = await DiscountModel.findOne<Discount>(conditions);

    if (!response) return null;

    return response;
  };

  static deleteById = async (id: string) => {
    const updated = await DiscountModel.update({ deleted_at: dateTimeSql(), is_public: false }, id);

    if (!updated) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static trash = async () => {
    const data = await DiscountService.getAll({ deleted_at: isNotNull() }, { limit: 5, page: 1 });
    return data;
  };

  static getByRoomId = async (roomId: number) => {
    const response = await DiscountModel.findAll<Discount>({ room_type_id: roomId }, undefined, {
      order: "created_at",
    });

    if (!response.length) return null;

    await Promise.all(
      response.map((discount, index) => {
        if (index === 0) return;
        return new Promise(async (resolve, reject) => {
          try {
            await DiscountModel.update<Partial<Discount>, Discount>({ is_public: 0 }, discount.id!);
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      })
    );

    const discount = response[0];

    const currentDateTime = dayjs();

    const timeEnd = dayjs(discount.time_end);

    const compare = timeEnd.diff(currentDateTime, "h", true);

    // console.log(`compare => `, { timeEnd, currentDateTime, compare });

    if (compare < 0) {
      await DiscountModel.update<Partial<Discount>, Discount>(
        { is_public: 0, status: "expired" },
        discount.id!
      );

      return null;
    }

    return discount;
  };

  static checkExpires = async () => {
    const { results } = await DiscountService.getAll({}, { limit: 9999 });

    if (!results.length) return;

    await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              if (!row?.discount) return resolve(true);

              const { time_end, status } = row?.discount;

              if (status === "expired") return resolve(true);

              const current = dayjs();
              const timeEnd = dayjs(new Date(time_end));

              const compare = timeEnd.diff(current, "minutes", true);

              if (compare <= 0) {
                await DiscountModel.update<Partial<Discount>, Discount>(
                  {
                    status: "expired",
                    is_public: 0,
                  },
                  row.id!,
                  "id"
                );
              }

              resolve(true);
            } catch (error) {
              reject(error);
            }
          })
      )
    );
  };
}

export default DiscountService;
