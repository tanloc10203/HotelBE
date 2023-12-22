import { Equipment, EquipmentRoomType, EquipmentRoomTypeModel } from "@/models";
import { EquipmentRoomTypeInputCreate, EquipmentRoomTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import EquipmentService from "./Equipment.service";

class EquipmentRoomTypeService {
  static create = async (data: EquipmentRoomTypeInputCreate) => {
    return await EquipmentRoomTypeModel.create(data);
  };

  static update = async (data: EquipmentRoomTypeInputUpdate["body"], id: number) => {
    let EquipmentRoomType: EquipmentRoomType | boolean;

    if (!(await EquipmentRoomTypeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await EquipmentRoomTypeModel.findOne<EquipmentRoomType>({ equipment_id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getByRoomTypeId = async (id: number) => {
    const data = await EquipmentRoomTypeModel.findAll<EquipmentRoomType>({ room_type_id: id });

    if (!data.length) return [];

    const results = await Promise.all(
      data.map(
        (row): Promise<Equipment | null> =>
          new Promise(async (resolve, reject) => {
            try {
              const equipment = await EquipmentService.findOne({ id: row.equipment_id });
              resolve(equipment || null);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await EquipmentRoomTypeModel.findAll<EquipmentRoomType>(
      filters,
      undefined,
      options
    );
    const total = await EquipmentRoomTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<EquipmentRoomType>) => {
    return await EquipmentRoomTypeModel.findOne<EquipmentRoomType>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await EquipmentRoomTypeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default EquipmentRoomTypeService;
