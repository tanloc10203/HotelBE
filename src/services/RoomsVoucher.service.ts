import { RoomsVoucher, RoomsVoucherModel } from "@/models";
import { RoomsVoucherInputCreate, RoomsVoucherInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import VoucherService from "./Voucher.service";

class RoomsVoucherService {
  static create = async (data: RoomsVoucherInputCreate) => {
    return await RoomsVoucherModel.create(data);
  };

  static update = async (data: RoomsVoucherInputUpdate["body"], id: number) => {
    let RoomsVoucher: RoomsVoucher | boolean;

    if (!(await RoomsVoucherModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getByRoomId = async (roomId: number) => {
    const response = await RoomsVoucherService.getAll(
      { room_id: roomId },
      { limit: 1, page: 1, order: "created_at" }
    );

    if (!response.results.length) return null;

    const roomsVoucher = response.results[0];

    // const voucher = await VoucherService.findOne({id: })

    return roomsVoucher;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await RoomsVoucherModel.findAll<RoomsVoucher>(filters, undefined, options);
    const total = await RoomsVoucherModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<RoomsVoucher>) => {
    return await RoomsVoucherModel.findOne<RoomsVoucher>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RoomsVoucherModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RoomsVoucherService;
