import { Unit, UnitModel } from "@/models";
import { UnitInputCreate, UnitInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError, rawLike } from "@/utils";
import { ObjectType } from "types";

class UnitService {
  static create = async (data: UnitInputCreate) => {
    const nameExists = await UnitModel.findOne<Unit>({ name: rawLike(data.name) });

    if (nameExists) {
      throw new ConflictRequestError(`Đơn vị \`${data.name}\` đã tồn tại...`);
    }

    const created = await UnitModel.create(data);

    return created;
  };

  static update = async (data: UnitInputUpdate["body"], id: number) => {
    const nameExists = await UnitModel.findOne<Unit>({ name: data.name });

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Đơn vị \`${data.name}\` đã tồn tại...`);
    }

    const updated = await UnitModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await UnitModel.findOne<Unit>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: {}) => {
    return await UnitModel.findAll<Unit>(filters);
  };

  static findOne = async (conditions: ObjectType<Unit>) => {
    return await UnitModel.findOne<Unit>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await UnitModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default UnitService;
