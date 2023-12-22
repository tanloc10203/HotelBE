import { RoomPrice, RoomPriceModel, RoomType } from "@/models";
import { RoomPriceInputCreate, RoomPriceInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import PriceByHourService from "./PriceByHour.service";
import RoomTypeService from "./RoomType.service";

export type GetAllStateRoomPrice = RoomType & {
  prices?: RoomPrice & {
    price_hours: Awaited<ReturnType<typeof PriceByHourService.getAll>>["results"];
  };
};

class RoomPriceService {
  static create = async (data: RoomPriceInputCreate) => {
    return await RoomPriceModel.create(data);
  };

  static update = async (data: RoomPriceInputUpdate["body"], id: number) => {
    let RoomPrice: RoomPrice | boolean;

    if (!(await RoomPriceModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await RoomPriceModel.findOne<RoomPrice>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getByRoomTypeId = async (roomTypeId: number) => {
    const response = await RoomPriceService.getAll(
      { room_type_id: roomTypeId },
      { page: 1, limit: 10, order: "created_at" }
    );

    if (!response.results.length) return null;

    return response.results[0];
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await RoomPriceModel.findAll<RoomPrice>(filters, undefined, options);
    const total = await RoomPriceModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<GetAllStateRoomPrice | null> =>
          new Promise(async (resolve, reject) => {
            try {
              const [{ results: price_hours }, roomType] = await Promise.all([
                PriceByHourService.getAll({ room_price_id: row.id }, { order: "start_hour,asc" }),
                RoomTypeService.findOne({ id: row.room_type_id }),
              ]);

              if (!roomType) {
                return resolve(null);
              }

              resolve({
                ...roomType,
                prices: {
                  ...row,
                  price_hours,
                },
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<RoomPrice>) => {
    return await RoomPriceModel.findOne<RoomPrice>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RoomPriceModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RoomPriceService;
