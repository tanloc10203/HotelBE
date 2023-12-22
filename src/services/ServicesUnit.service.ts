import { ServicesUnit, ServicesUnitModel, Unit } from "@/models";
import { ServicesUnitInputCreate, ServicesUnitInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import UnitService from "./Unit.service";

class ServicesUnitService {
  static create = async (data: ServicesUnitInputCreate) => {
    return await ServicesUnitModel.create(data);
  };

  static update = async (data: ServicesUnitInputUpdate["body"], id: string) => {
    let ServicesUnit: ServicesUnit | boolean;

    if (!(await ServicesUnitModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await ServicesUnitModel.findOne<ServicesUnit>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const unitData = await UnitService.findOne({ id: data.unit_id });

    return { ...data, unitData: unitData || null };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ServicesUnitModel.findAll<ServicesUnit>(filters, undefined, options);
    const total = await ServicesUnitModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<ServicesUnit & { unitData: null | Unit }> =>
          new Promise(async (resolve, reject) => {
            try {
              const unitData = await UnitService.findOne({ id: row.unit_id });

              resolve({ ...row, unitData: unitData || null });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<ServicesUnit>) => {
    return await ServicesUnitModel.findOne<ServicesUnit>(conditions);
  };

  static deleteById = async (id: string) => {
    if (!(await ServicesUnitModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ServicesUnitService;
