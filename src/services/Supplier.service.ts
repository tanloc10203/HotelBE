import { Supplier, SupplierModel } from "@/models";
import { SupplierInputCreate, SupplierInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  generateUUIDv2,
  rawLike,
} from "@/utils";
import { ObjectType, Pagination } from "types";

class SupplierService {
  static create = async (data: SupplierInputCreate) => {
    const [phoneExists, nameExists] = await Promise.all([
      SupplierService.findOne({ phone_number: data.phone_number }),
      SupplierService.findOne({ name: rawLike(data.name) }),
    ]);

    if (nameExists) {
      throw new ConflictRequestError(`Tên nhà cung cấp đã tồn tại`);
    }

    if (phoneExists) {
      throw new ConflictRequestError(`Số điện thoại đã tồn tại`);
    }

    return await SupplierModel.create({ ...data, id: generateUUIDv2("SID") });
  };

  static update = async (data: SupplierInputUpdate["body"], id: string) => {
    const [phoneExists, nameExists] = await Promise.all([
      SupplierService.findOne({ phone_number: data.phone_number }),
      SupplierService.findOne({ name: rawLike(data.name) }),
    ]);

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Tên nhà cung cấp đã tồn tại`);
    }

    if (phoneExists && phoneExists.id !== id) {
      throw new ConflictRequestError(`Số điện thoại đã tồn tại`);
    }

    if (!(await SupplierModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await SupplierModel.findOne<Supplier>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await SupplierModel.findAll<Supplier>(filters, undefined, options);
    const total = await SupplierModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Supplier>) => {
    return await SupplierModel.findOne<Supplier>(conditions);
  };

  static deleteById = async (id: string) => {
    if (!(await SupplierModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default SupplierService;
