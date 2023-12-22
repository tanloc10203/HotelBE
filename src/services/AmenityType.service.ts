import { AmenityType, AmenityTypeModel } from "@/models";
import { AmenityTypeInputCreate, AmenityTypeInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import AmenitieService from "./Amenitie.service";

class AmenityTypeService {
  static create = async (data: AmenityTypeInputCreate) => {
    const exists = await AmenityTypeService.findOne({ name: data.name });

    if (exists) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại...`);
    }

    const created = await AmenityTypeModel.create(data);

    return created;
  };

  static update = async (data: AmenityTypeInputUpdate["body"], id: number) => {
    let AmenityType: AmenityType | boolean = await AmenityTypeService.findOne({ name: data.name });

    if (AmenityType && AmenityType.id !== id) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại...`);
    }

    const updated = await AmenityTypeModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await AmenityTypeModel.findOne<AmenityType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await AmenityTypeModel.findAll<AmenityType>(filters, undefined, options);
    const total = await AmenityTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<AmenityType>) => {
    return await AmenityTypeModel.findOne<AmenityType>(conditions);
  };

  static deleteById = async (id: number) => {
    const constrains = await AmenitieService.findOne({ type_id: id });

    if (constrains) {
      throw new ForbiddenRequestError(
        `Bạn không được phép xóa. Dữ liệu đang bị ràng buộc bởi tiện nghi khác`
      );
    }

    const deleted = await AmenityTypeModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default AmenityTypeService;
