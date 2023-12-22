import { Operation, OperationModel } from "@/models";
import { OperationInputCreate, OperationInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";
import DepartmentService from "./Department.service";
import PositionService from "./Position.service";

class OperationService {
  static create = async (data: OperationInputCreate) => {
    return await OperationModel.create(data);
  };

  static update = async (data: OperationInputUpdate["body"], id: number, key?: keyof Operation) => {
    let Operation: Operation | boolean;

    if (!(await OperationModel.update(data, id, key))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await OperationModel.findOne<Operation>({ department_id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getByEmployeeId = async (id: number) => {
    const data = await OperationService.findOne({ employee_id: id });

    if (!data) {
      return { department: null, position: null };
    }

    const [department, position] = await Promise.all([
      DepartmentService.findOne({ id: data.department_id }),
      PositionService.findOne({ id: data.position_id }),
    ]);

    return { department: department || null, position: position || null };
  };

  static getAll = async (filters: Record<string, any>) => {
    return await OperationModel.findAll<Operation>(filters);
  };

  static findOne = async (conditions: ObjectType<Operation>) => {
    return await OperationModel.findOne<Operation>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await OperationModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default OperationService;
