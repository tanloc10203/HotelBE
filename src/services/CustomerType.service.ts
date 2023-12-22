import { CustomerType, CustomerTypeModel } from "@/models";
import { CustomerTypeInputCreate, CustomerTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";

class CustomerTypeService {
  static create = async (data: CustomerTypeInputCreate) => {
    return await CustomerTypeModel.create(data);
  };

  static update = async (data: CustomerTypeInputUpdate["body"], id: number) => {
    let CustomerType: CustomerType | boolean;

    if (!(await CustomerTypeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await CustomerTypeModel.findOne<CustomerType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static findOne = async (conditions: ObjectType<CustomerType>) => {
    return await CustomerTypeModel.findOne<CustomerType>(conditions);
  };

  static getAll = async (filters: {}) => {
    return await CustomerTypeModel.findAll<CustomerType>(filters);
  };

  static deleteById = async (id: number) => {
    if (!(await CustomerTypeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default CustomerTypeService;
