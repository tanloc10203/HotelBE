import { ServiceType, ServiceTypeModel } from "@/models";
import { ServiceTypeInputCreate, ServiceTypeInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
  generateUUIDv2,
  rawLike,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import ServiceService from "./Service.service";

class ServiceTypeService {
  static create = async (data: ServiceTypeInputCreate) => {
    const nameExist = await ServiceTypeService.findOne({ name: rawLike(data.name) });

    if (nameExist) {
      throw new ConflictRequestError(`Tên loại dịch \`${data.name}\` vụ đã tồn tại`);
    }

    return await ServiceTypeModel.create({ ...data, id: generateUUIDv2("STID") });
  };

  static update = async (data: ServiceTypeInputUpdate["body"], id: string) => {
    const nameExist = await ServiceTypeService.findOne({ name: rawLike(data.name) });

    if (nameExist && nameExist.id !== id) {
      throw new ConflictRequestError(`Tên loại dịch \`${data.name}\` vụ đã tồn tại`);
    }

    const updated = await ServiceTypeModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await ServiceTypeModel.findOne<ServiceType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await ServiceTypeModel.findAll<ServiceType>(filters, undefined, options);
    const total = await ServiceTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<ServiceType>) => {
    return await ServiceTypeModel.findOne<ServiceType>(conditions);
  };

  static deleteById = async (id: string) => {
    const serviceExists = await ServiceService.findOne({ service_type_id: id });

    if (serviceExists) {
      throw new ForbiddenRequestError(`Không được phép xóa. Dịch vụ đang tồn tại`);
    }

    const deleted = await ServiceTypeModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ServiceTypeService;
