import { RoomsDiscount, RoomsDiscountModel } from "@/models";
import { RoomsDiscountInputCreate, RoomsDiscountInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class RoomsDiscountService {
  static create = async (data: RoomsDiscountInputCreate) => {
    return await RoomsDiscountModel.create(data);
  };

  static update = async (data: RoomsDiscountInputUpdate["body"], id: number) => {
    let RoomsDiscount: RoomsDiscount | boolean;

    if (!(await RoomsDiscountModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getByRoomId = async (roomId: number) => {
    const response = await RoomsDiscountService.getAll(
      { room_id: roomId },
      { limit: 10, page: 1, order: "created_at" }
    );

    return response.results.length ? response.results[0] : null;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await RoomsDiscountModel.findAll<RoomsDiscount>(filters, undefined, options);
    const total = await RoomsDiscountModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<RoomsDiscount>) => {
    return await RoomsDiscountModel.findOne<RoomsDiscount>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RoomsDiscountModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RoomsDiscountService;
