import { Bill, BillModel } from "@/models";
import { BillInputCreate, BillInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class BillService {
  static create = async (data: BillInputCreate) => {
    return await BillModel.create(data);
  };

  static update = async (data: BillInputUpdate["body"], id: number) => {
    let Bill: Bill | boolean;

    if (!(await BillModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await BillModel.findOne<Bill>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await BillModel.findAll<Bill>(filters, undefined, options);
    const total = await BillModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Bill>) => {
    return await BillModel.findOne<Bill>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await BillModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default BillService;
