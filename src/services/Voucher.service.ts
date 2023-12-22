import { Voucher, VoucherModel } from "@/models";
import { VoucherInputCreate, VoucherInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class VoucherService {
  static create = async (data: VoucherInputCreate) => {
    return await VoucherModel.create(data);
  };

  static update = async (data: VoucherInputUpdate["body"], id: number) => {
    let Voucher: Voucher | boolean;

    if (!(await VoucherModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await VoucherModel.findOne<Voucher>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await VoucherModel.findAll<Voucher>(filters, undefined, options);
    const total = await VoucherModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Voucher>) => {
    return await VoucherModel.findOne<Voucher>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await VoucherModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default VoucherService;
