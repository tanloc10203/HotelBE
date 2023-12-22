import { Bed, BedModel, Equipment, EquipmentType } from "@/models";
import { BedInputCreate, BedInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError, isNull } from "@/utils";
import { ObjectType, Pagination } from "types";
import EquipmentService from "./Equipment.service";

interface ResponseGetByRoomId extends Bed {
  bed: Equipment & { typeData: EquipmentType };
}

class BedService {
  static create = async (data: BedInputCreate) => {
    return await BedModel.create(data);
  };

  static update = async (data: BedInputUpdate["body"], id: number) => {
    let Bed: Bed | boolean;

    if (!(await BedModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await BedModel.findOne<Bed>({ bed_id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getByRoomId = async (roomId: number) => {
    const response = await BedModel.findAll<Bed>({ room_id: roomId, deleted_at: isNull() });

    if (!response.length) return [];

    const results = await Promise.all(
      response.map(
        (r): Promise<ResponseGetByRoomId> =>
          new Promise(async (resolve, reject) => {
            try {
              const bed = await EquipmentService.getById(r.bed_id);
              resolve({ ...r, bed });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await BedModel.findAll<Bed>(filters, undefined, options);
    const total = await BedModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Bed>) => {
    return await BedModel.findOne<Bed>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await BedModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default BedService;
