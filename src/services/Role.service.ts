import { Transaction } from "@/lib";
import { Role, RoleModel, RolePayload, RolePermission, RolePermissionModel } from "@/models";
import { RoleInputCreate, RoleInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { raw } from "mysql2";
import RolePermissionService from "./RolePermission.service";

class RoleService {
  static create = async (data: RoleInputCreate) => {
    if (await RoleModel.findOne<Role>({ name: data.name })) {
      throw new ConflictRequestError(`Tên vai trò\`${data.name}\` đã đã tồn tại...`);
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();
    const { desc, name, permissions } = data;

    try {
      await connection.beginTransaction();

      const lastInsertId = await transaction.create<Role>({
        data: { desc, name },
        pool: connection,
        table: RoleModel.getTable,
      });

      const insertBulk: number[][] = permissions.map((p) => [p.id, lastInsertId]);

      await transaction.createBulk({
        pool: connection,
        table: RolePermissionModel.getTable,
        fillables: RolePermissionModel.getFillables,
        data: insertBulk,
      });

      await connection.commit();

      const roleAfterInsert = await RoleService.getById(lastInsertId);

      return roleAfterInsert;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static update = async (data: RoleInputUpdate["body"], id: number) => {
    let Role: Role | boolean;

    Role = await RoleModel.findOne<Role>({ name: data.name });

    if (Role && Role.id !== id) {
      throw new ConflictRequestError(`Tên vai trò\`${data.name}\` đã đã tồn tại...`);
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();
    const { desc, name, permissions } = data;

    try {
      await connection.beginTransaction();

      const insertBulk: number[][] = permissions.map((p) => [p.id, id]);

      await Promise.all(
        permissions.map(
          (p) =>
            new Promise(async (resolve, reject) => {
              try {
                const response = await transaction.delete<RolePermission>({
                  conditions: { role_id: id },
                  pool: connection,
                  table: RolePermissionModel.getTable,
                });

                resolve(response);
              } catch (error) {
                reject(error);
              }
            })
        )
      );

      const [insertPerRole, updateRole] = await Promise.all([
        transaction.createBulk({
          pool: connection,
          table: RolePermissionModel.getTable,
          fillables: RolePermissionModel.getFillables,
          data: insertBulk,
        }),
        transaction.update<Role, Role>({
          data: { desc, name },
          pool: connection,
          table: RoleModel.getTable,
          key: "id",
          valueOfKey: id,
        }),
      ]);

      if (!insertPerRole || !updateRole) {
        throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
      }

      const roleAfterUpdate = await RoleService.getById(id);

      await connection.commit();

      return roleAfterUpdate;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static getById = async (id: number): Promise<RolePayload> => {
    const [role, permissions] = await Promise.all([
      RoleModel.findOne<Role>({ id: id }),
      RolePermissionService.getAll({ role_id: id }),
    ]);

    if (!role || !permissions.length) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return { ...role, permissions };
  };

  static getAll = async (filters: any) => {
    if (filters?.name) {
      filters.name = raw(`LIKE '%${filters.name}%'`);
    }

    const data = await RoleModel.findAll<Role>(filters);

    const results = await Promise.all(
      data.map(
        (d) =>
          new Promise(async (resolve, reject) => {
            try {
              const response = await RolePermissionService.getAll({ role_id: d.id });
              resolve({ ...d, permissions: response });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static deleteById = async (id: number) => {
    const deleted = await RoleModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RoleService;
