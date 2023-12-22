import { PriceByHour, PriceByHourModel } from "@/models";
import { PriceByHourInputCreate, PriceByHourInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError, isNull } from "@/utils";
import { ObjectType, Pagination } from "types";

class PriceByHourService {
  static create = async (data: PriceByHourInputCreate) => {
    return await PriceByHourModel.create(data);
  };

  static update = async (data: PriceByHourInputUpdate["body"], id: number) => {
    let PriceByHour: PriceByHour | boolean;

    if (!(await PriceByHourModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await PriceByHourModel.findOne<PriceByHour>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    filters = { deleted_at: isNull(), ...filters };
    const results = await PriceByHourModel.findAll<PriceByHour>(filters, undefined, options);
    const total = await PriceByHourModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<PriceByHour>) => {
    return await PriceByHourModel.findOne<PriceByHour>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await PriceByHourModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default PriceByHourService;
