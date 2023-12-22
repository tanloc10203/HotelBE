import { DurationsRoom, DurationsRoomModel } from "@/models";
import { DurationsRoomInputCreate, DurationsRoomInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class DurationsRoomService {
  static create = async (data: DurationsRoomInputCreate) => {
    return await DurationsRoomModel.create(data);
  };

  static update = async (data: DurationsRoomInputUpdate["body"], id: number) => {
    let DurationsRoom: DurationsRoom | boolean;

    if (!(await DurationsRoomModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await DurationsRoomModel.findOne<DurationsRoom>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await DurationsRoomModel.findAll<DurationsRoom>(filters, undefined, options);
    const total = await DurationsRoomModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<DurationsRoom>) => {
    return await DurationsRoomModel.findOne<DurationsRoom>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await DurationsRoomModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default DurationsRoomService;
