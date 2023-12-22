import { CustomerInfo, CustomerInfoModel } from "@/models";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";

class CustomerInfoService {
  static create = async (data: CustomerInfo) => {
    return await CustomerInfoModel.create(data);
  };

  static update = async (data: Partial<CustomerInfo>, id: number, key?: keyof CustomerInfo) => {
    if (!(await CustomerInfoModel.update<Partial<CustomerInfo>, CustomerInfo>(data, id, key))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await CustomerInfoModel.findOne<CustomerInfo>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static findOne = async (conditions: ObjectType<CustomerInfo>) => {
    const data = await CustomerInfoModel.findOne<CustomerInfo>(conditions);
    return data;
  };

  static getAll = async (filters: {}) => {
    return await CustomerInfoModel.findAll<CustomerInfo>(filters);
  };

  static deleteById = async (id: number) => {
    if (!(await CustomerInfoModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default CustomerInfoService;
