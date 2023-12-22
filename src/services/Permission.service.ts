import { Permission, PermissionModel } from "@/models";
import { PermissionInputCreate, PermissionInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
} from "@/utils";
import { raw } from "mysql2";
import RolePermissionService from "./RolePermission.service";

class PermissionService {
  static create = async (data: PermissionInputCreate) => {
    if (await PermissionModel.findOne<Permission>({ name: data.name })) {
      throw new ConflictRequestError("Tên quyền đã tồn tại...");
    }

    if (await PermissionModel.findOne<Permission>({ alias: data.alias })) {
      throw new ConflictRequestError("Định danh tên quyền đã tồn tại...");
    }

    const lastInsertId = await PermissionModel.create(data);

    return PermissionService.getById(lastInsertId);
  };

  static update = async (data: PermissionInputUpdate["body"], id: number) => {
    let Permission: Permission | boolean;

    Permission = await PermissionModel.findOne<Permission>({ name: data.name });

    if (Permission && Permission.id !== id) {
      throw new ConflictRequestError("name đã tồn tại...");
    }

    Permission = await PermissionModel.findOne<Permission>({ alias: data.alias });

    if (Permission && Permission.id !== id) {
      throw new ConflictRequestError("alias đã tồn tại...");
    }

    const updated = await PermissionModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    const permissionNew = await PermissionService.getById(id);

    return permissionNew;
  };

  static getById = async (id: number) => {
    const data = await PermissionModel.findOne<Permission>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: any) => {
    if (filters?.name) {
      filters.name = raw(`LIKE '%${filters.name}%'`);
    }

    return await PermissionModel.findAll<Permission>(filters);
  };

  static deleteById = async (id: number) => {
    const findExistPermission = await RolePermissionService.findOne({ permission_id: id });

    if (findExistPermission)
      throw new ForbiddenRequestError(
        `Không được phép xóa. Quyền này đang tồn tại ở vai trò nào đó.`
      );

    const deleted = await PermissionModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return id;
  };
}

export default PermissionService;
