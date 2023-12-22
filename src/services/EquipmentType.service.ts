import { EquipmentType, EquipmentTypeModel } from "@/models";
import { EquipmentTypeInputCreate, EquipmentTypeInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import EquipmentService from "./Equipment.service";

class EquipmentTypeService {
  static create = async (data: EquipmentTypeInputCreate) => {
    const exists = await EquipmentTypeModel.findOne<EquipmentType>({ name: data.name });

    if (exists) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại...`);
    }

    const created = await EquipmentTypeModel.create(data);

    return created;
  };

  static update = async (data: EquipmentTypeInputUpdate["body"], id: number) => {
    let EquipmentType: EquipmentType | boolean;

    EquipmentType = await EquipmentTypeModel.findOne<EquipmentType>({ name: data.name });

    if (EquipmentType && EquipmentType.id !== id) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại...`);
    }

    const updated = await EquipmentTypeModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await EquipmentTypeModel.findOne<EquipmentType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await EquipmentTypeModel.findAll<EquipmentType>(filters, undefined, options);
    const total = await EquipmentTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<EquipmentType>) => {
    return await EquipmentTypeModel.findOne<EquipmentType>(conditions);
  };

  static deleteById = async (id: number) => {
    const constrains = await EquipmentService.findOne({ equipment_type_id: id });

    if (constrains) {
      throw new ForbiddenRequestError(
        `Không được phép xóa dữ liệu đang bị ràng buộc bởi 1 thiết bị`
      );
    }

    const deleted = await EquipmentTypeModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default EquipmentTypeService;
