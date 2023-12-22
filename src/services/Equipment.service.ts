import { Transaction } from "@/lib";
import {
  Equipment,
  EquipmentModel,
  EquipmentRoomType,
  EquipmentRoomTypeModel,
  Group,
} from "@/models";
import { EquipmentInputCreate, EquipmentInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  dateTimeSql,
  isNotNull,
  isNull,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import EquipmentTypeService from "./EquipmentType.service";

class EquipmentService {
  static create = async (data: EquipmentInputCreate) => {
    const exists = await EquipmentModel.findOne<Equipment>({ name: data.name });

    if (exists) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại...`);
    }

    const created = await EquipmentModel.create(data);

    return created;
  };

  static update = async (data: EquipmentInputUpdate["body"], id: number) => {
    let Equipment: Equipment | boolean;

    Equipment = await EquipmentModel.findOne<Equipment>({ name: data.name });

    if (Equipment && Equipment.id !== id) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại...`);
    }

    const updated = await EquipmentModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await EquipmentService.findOne({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const type = await EquipmentTypeService.getById(data.equipment_type_id!);

    return { ...data, typeData: type };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    if (filters?.delete_not_null) {
      filters = { ...filters, deleted_at: isNotNull() };
      delete filters.delete_not_null;
    }

    filters = { deleted_at: isNull(), ...filters };

    const results = await EquipmentModel.findAll<Equipment>(filters, undefined, options);

    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const type = await EquipmentTypeService.getById(row.equipment_type_id!);
              resolve({ ...row, typeData: type });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    const total = await EquipmentModel.count(filters);
    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Equipment>) => {
    return await EquipmentModel.findOne<Equipment>({ deleted_at: isNull(), ...conditions });
  };

  static deleteById = async (id: number) => {
    const deleted = await EquipmentModel.update<Partial<Equipment>, Equipment>(
      { deleted_at: dateTimeSql() },
      id,
      "id"
    );

    if (!deleted) {
      throw new NotFoundRequestError(`Xóa thiết bị tạm thời thất bại. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static truncateTrash = async (id: number) => {
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.delete<EquipmentRoomType>({
          conditions: { equipment_id: id },
          pool: connection,
          table: EquipmentRoomTypeModel.getTable,
        }),
      ]);

      const deleted = await transaction.delete<Equipment>({
        conditions: { id: id },
        pool: connection,
        table: EquipmentModel.getTable,
      });

      if (!deleted) {
        throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return true;
  };

  static restore = async (id: number) => {
    let restored = await EquipmentModel.update<Partial<Equipment>, Equipment>(
      { deleted_at: null },
      id,
      "id"
    );

    if (!restored) {
      throw new NotFoundRequestError(
        `Đã lỗi xảy ra khi khôi phục dữ liệu loại phòng. Không tìm thấy id = ${id}`
      );
    }

    return true;
  };

  static getGroups = () => EquipmentModel.Groups;

  static getFilterByGroup = async (group: Group) => {
    const response = await EquipmentModel.findAll<Equipment>({
      group: group,
      deleted_at: isNull(),
    });

    if (!response.length) return [];

    const data = await Promise.all(
      response.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const type = await EquipmentTypeService.getById(row.equipment_type_id!);
              resolve({ ...row, typeData: type });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return data;
  };
}

export default EquipmentService;
