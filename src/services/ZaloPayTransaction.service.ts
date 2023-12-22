import { ZaloPayTransaction, ZaloPayTransactionModel } from "@/models";
import { ZaloPayTransactionInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class ZaloPayTransactionService {
  static create = async (data: ZaloPayTransaction) => {
    return await ZaloPayTransactionModel.create(data);
  };

  static update = async (data: ZaloPayTransactionInputUpdate["body"], id: number) => {
    let ZaloPayTransaction: ZaloPayTransaction | boolean;

    if (!(await ZaloPayTransactionModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await ZaloPayTransactionModel.findOne<ZaloPayTransaction>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ZaloPayTransactionModel.findAll<ZaloPayTransaction>(
      filters,
      undefined,
      options
    );
    const total = await ZaloPayTransactionModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<ZaloPayTransaction>) => {
    return await ZaloPayTransactionModel.findOne<ZaloPayTransaction>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ZaloPayTransactionModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ZaloPayTransactionService;
