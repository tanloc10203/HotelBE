import { OwnerInfo, OwnerInfoModel } from "@/models";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";

type Update = Partial<OwnerInfo>;

class OwnerInfoService {
  static create = async (data: OwnerInfo) => {
    return await OwnerInfoModel.create(data);
  };

  static update = async (data: Update, id: number, key?: keyof OwnerInfo) => {
    if (!(await OwnerInfoModel.update<Update, OwnerInfo>(data, id, key))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await OwnerInfoModel.findOne<OwnerInfo>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static findOne = async (conditions: ObjectType<OwnerInfo>) => {
    const response = await OwnerInfoModel.findOne(conditions);
    return response;
  };

  static getAll = async (filters: {}) => {
    return await OwnerInfoModel.findAll<OwnerInfo>(filters);
  };

  static deleteById = async (id: number) => {
    if (!(await OwnerInfoModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default OwnerInfoService;
