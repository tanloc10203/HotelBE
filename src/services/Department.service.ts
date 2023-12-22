import { Department, DepartmentModel } from "@/models";
import { DepartmentInputCreate, DepartmentInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
} from "@/utils";
import { raw } from "mysql2";
import { ObjectType } from "types";
import OperationService from "./Operation.service";

class DepartmentService {
  static create = async (data: DepartmentInputCreate) => {
    const departmentExist = await DepartmentService.findOne({ name: data.name });

    if (departmentExist) {
      throw new ConflictRequestError(`Tên bộ phận \`${data.name}\` đã tồn tại`);
    }

    const lastIdInsert = await DepartmentModel.create(data);

    const dataAfterInsert = await DepartmentService.getById(lastIdInsert);

    return dataAfterInsert;
  };

  static update = async (data: DepartmentInputUpdate["body"], id: number) => {
    let Department: Department | boolean = await DepartmentService.findOne({ name: data.name });

    if (Department && Department.id! !== id) {
      throw new ConflictRequestError(`Tên bộ phận \`${data.name}\` đã tồn tại`);
    }

    Department = await DepartmentModel.update(data, id);

    if (!Department) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    const dataAfterUpdate = await DepartmentService.getById(id);

    return dataAfterUpdate;
  };

  static getById = async (id: number) => {
    const data = await DepartmentModel.findOne<Department>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>) => {
    if (filters?.name) {
      filters.name = raw(`LIKE '%${filters.name}%'`);
    }

    return await DepartmentModel.findAll<Department>(filters);
  };

  static findOne = async (conditions: ObjectType<Department>) => {
    return await DepartmentModel.findOne<Department>(conditions);
  };

  static deleteById = async (id: number) => {
    const findPosition = await OperationService.findOne({ department_id: id });

    if (findPosition) {
      throw new ForbiddenRequestError(
        `Bạn không được phép xóa. Bộ này đang ràng buộc bởi nhân viên nào đó`
      );
    }

    const deleted = await DepartmentModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default DepartmentService;
