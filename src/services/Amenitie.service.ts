import { Amenitie, AmenitieModel, AmenityRoomType, AmenityRoomTypeModel } from "@/models";
import { AmenitieInputCreate, AmenitieInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  dateTimeSql,
  isNotNull,
  isNull,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import AmenityTypeService from "./AmenityType.service";
import { Transaction } from "@/lib";

class AmenitieService {
  static create = async (data: AmenitieInputCreate) => {
    const exists = await AmenitieService.findOne({ name: data.name });

    if (exists) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại`);
    }

    const created = await AmenitieModel.create(data);

    return created;
  };

  static update = async (data: AmenitieInputUpdate["body"], id: number) => {
    let Amenitie: Amenitie | boolean = await AmenitieService.findOne({ name: data.name });

    if (Amenitie && Amenitie.id !== id) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại`);
    }

    const updated = await AmenitieModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await AmenitieService.findOne({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const type = await AmenityTypeService.getById(data.type_id);

    return { ...data, typeData: type };
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    if (filters?.delete_not_null) {
      filters = { ...filters, deleted_at: isNotNull() };
      delete filters.delete_not_null;
    }

    filters = { deleted_at: isNull(), ...filters };

    const results = await AmenitieModel.findAll<Amenitie>(filters, undefined, options);
    if (!results.length) return { results: [], total: 0 };
    const total = await AmenitieModel.count(filters);

    const data = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const type = await AmenityTypeService.getById(row.type_id);
              resolve({ ...row, typeData: type });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Amenitie>) => {
    return await AmenitieModel.findOne<Amenitie>({ deleted_at: isNull(), ...conditions });
  };

  static deleteById = async (id: number) => {
    const deleted = await AmenitieModel.update<Partial<Amenitie>, Amenitie>(
      { deleted_at: dateTimeSql() },
      id,
      "id"
    );

    if (!deleted) {
      throw new NotFoundRequestError(`Xóa tiện nghi tạm thời thất bại. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static truncateTrash = async (id: number) => {
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.delete<AmenityRoomType>({
          conditions: { amenity_id: id },
          pool: connection,
          table: AmenityRoomTypeModel.getTable,
        }),
      ]);

      const deleted = await transaction.delete<Amenitie>({
        conditions: { id: id },
        pool: connection,
        table: AmenitieModel.getTable,
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
    let restored = await AmenitieModel.update<Partial<Amenitie>, Amenitie>(
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
}

export default AmenitieService;
