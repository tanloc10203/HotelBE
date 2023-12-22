import { MomoTransaction, MomoTransactionModel } from "@/models";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class MomoTransactionService {
  static create = async (data: MomoTransaction) => {
    return await MomoTransactionModel.create(data);
  };

  static update = async (data: Partial<MomoTransaction>, id: string) => {
    let MomoTransaction: MomoTransaction | boolean;

    if (!(await MomoTransactionModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await MomoTransactionModel.findOne<MomoTransaction>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await MomoTransactionModel.findAll<MomoTransaction>(
      filters,
      undefined,
      options
    );
    const total = await MomoTransactionModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<MomoTransaction>) => {
    return await MomoTransactionModel.findOne<MomoTransaction>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await MomoTransactionModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default MomoTransactionService;
