import { RoleEmployee, RoleEmployeeModel, RolePayload } from "@/models";
import { RoleEmployeeInputCreate, RoleEmployeeInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";
import RoleService from "./Role.service";

class RoleEmployeeService {
  static create = async (data: RoleEmployeeInputCreate) => {
    const { employee_id, roles } = data;

    const findExist = await RoleEmployeeService.getByEmployeeId(+employee_id);

    if (findExist.length) {
      // TODO: update => delete all where by employee_id
      await RoleEmployeeModel.delete<RoleEmployee>({ employee_id: employee_id });
    }

    const insertBulk = roles.map((role) => [employee_id, role.id]);

    await RoleEmployeeModel.createBulk(insertBulk);

    const response = await RoleEmployeeService.getByEmployeeId(+employee_id);

    return response;
  };

  static update = async (data: RoleEmployeeInputUpdate["body"], id: number) => {
    let RoleEmployee: RoleEmployee | boolean;

    if (!(await RoleEmployeeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    // const data = await RoleEmployeeModel.findOne<RoleEmployee>({ id: id });
    // if (!data) {
    // 	throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    // }
    // return data;
  };

  static getByEmployeeId = async (id: number) => {
    const roles = await RoleEmployeeService.getAll({ employee_id: id });

    if (!roles.length) return [];

    const results = await Promise.all(
      roles.map(
        (role): Promise<RolePayload> =>
          new Promise(async (resolve, reject) => {
            try {
              const response = await RoleService.getById(role.role_id);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static getAll = async (filters: {}) => {
    return await RoleEmployeeModel.findAll<RoleEmployee>(filters);
  };

  static findOne = async (conditions: ObjectType<RoleEmployee>) => {
    return await RoleEmployeeModel.findOne<RoleEmployee>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RoleEmployeeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RoleEmployeeService;
