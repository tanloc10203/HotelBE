import { Amenitie, AmenityRoomType, AmenityRoomTypeModel } from "@/models";
import { AmenityRoomTypeInputCreate, AmenityRoomTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import AmenitieService from "./Amenitie.service";

class AmenityRoomTypeService {
  static create = async (data: AmenityRoomTypeInputCreate) => {
    return await AmenityRoomTypeModel.create(data);
  };

  static update = async (data: AmenityRoomTypeInputUpdate["body"], id: number) => {
    let AmenityRoomType: AmenityRoomType | boolean;

    if (!(await AmenityRoomTypeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await AmenityRoomTypeModel.findOne<AmenityRoomType>({ room_type_id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getByRoomTypeId = async (id: number) => {
    const data = await AmenityRoomTypeModel.findAll<AmenityRoomType>({ room_type_id: id });

    if (!data.length) return [];

    const results = await Promise.all(
      data.map(
        (row): Promise<Amenitie | null> =>
          new Promise(async (resolve, reject) => {
            try {
              const amenitie = await AmenitieService.findOne({ id: row.amenity_id });
              resolve(amenitie || null);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return results;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await AmenityRoomTypeModel.findAll<AmenityRoomType>(
      filters,
      undefined,
      options
    );
    const total = await AmenityRoomTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<AmenityRoomType>) => {
    return await AmenityRoomTypeModel.findOne<AmenityRoomType>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await AmenityRoomTypeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default AmenityRoomTypeService;
