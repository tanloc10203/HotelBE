import { EmployeeInfo, EmployeeInfoModel } from "@/models";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";

class EmployeeInfoService {
  static create = async (data: EmployeeInfo) => {
    return await EmployeeInfoModel.create(data);
  };

  static update = async (data: Partial<EmployeeInfo>, id: number, key?: keyof EmployeeInfo) => {
    if (!(await EmployeeInfoModel.update<Partial<EmployeeInfo>, EmployeeInfo>(data, id, key))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await EmployeeInfoModel.findOne<EmployeeInfo>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: {}) => {
    return await EmployeeInfoModel.findAll<EmployeeInfo>(filters);
  };

  static findOne = async (conditions: ObjectType<EmployeeInfo>) => {
    const response = await EmployeeInfoModel.findOne(conditions);
    return response;
  };

  static deleteById = async (id: number) => {
    if (!(await EmployeeInfoModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default EmployeeInfoService;
