import { Rate, RateModel } from "@/models";
import { RateInputCreate, RateInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUIDv2, getInfoData } from "@/utils";
import { ObjectType, Pagination } from "types";
import CustomerService from "./Customer.service";
import { resultUrlImage } from "@/lib";
import RoomService from "./Room.service";

class RateService {
  static create = async (data: RateInputCreate) => {
    return await RateModel.create({ ...data, id: generateUUIDv2("RID") });
  };

  static update = async (data: RateInputUpdate["body"], id: string) => {
    let Rate: Rate | boolean;

    if (!(await RateModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await RateModel.findOne<Rate>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await RateModel.findAll<Rate>(filters, undefined, options);
    const total = await RateModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const customer = await CustomerService.getById(row.customer_id);
              const room = await RoomService.getById(row.room_id!);

              const {
                roomType: { name },
              } = room;

              const data = getInfoData(customer, ["display_name", "id", "photo"]);

              resolve({
                ...row,
                roomTypeName: name,
                customer: { ...data, photo: data?.photo ? resultUrlImage(data.photo) : "" },
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Rate>) => {
    return await RateModel.findOne<Rate>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RateModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RateService;
