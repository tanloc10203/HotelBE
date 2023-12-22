import { Permission, RolePermission, RolePermissionModel } from "@/models";
import { RolePermissionInputCreate, RolePermissionInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType } from "types";
import PermissionService from "./Permission.service";

class RolePermissionService {
  static create = async (data: RolePermissionInputCreate) => {
    return await RolePermissionModel.create(data);
  };

  static update = async (data: RolePermissionInputUpdate["body"], id: number) => {
    let RolePermission: RolePermission | boolean;

    if (!(await RolePermissionModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await RolePermissionModel.findOne<RolePermission>({});

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: {}) => {
    const response = await RolePermissionModel.findAll<RolePermission>(filters);

    const permission = await Promise.all(
      response.map(
        (item): Promise<Permission> =>
          new Promise(async (resolve, reject) => {
            try {
              const permission = await PermissionService.getById(item.permission_id);
              resolve(permission);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return permission;
  };

  static findOne = async (conditions: ObjectType<RolePermission>) => {
    const data = await RolePermissionModel.findOne<RolePermission>(conditions);
    return data;
  };

  static deleteById = async (id: number) => {
    if (!(await RolePermissionModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RolePermissionService;
