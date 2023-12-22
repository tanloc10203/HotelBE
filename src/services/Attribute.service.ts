import { Attribute, AttributeModel } from "@/models";
import { AttributeInputCreate, AttributeInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUID } from "@/utils";
import { ObjectType, Pagination } from "types";

class AttributeService {
  static create = async (data: AttributeInputCreate) => {
    const id = generateUUID("AT");
    return await AttributeModel.create({ ...data, id });
  };

  static update = async (data: AttributeInputUpdate["body"], id: number) => {
    let Attribute: Attribute | boolean;

    if (!(await AttributeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await AttributeModel.findOne<Attribute>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await AttributeModel.findAll<Attribute>(filters, undefined, options);
    const total = await AttributeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Attribute>) => {
    return await AttributeModel.findOne<Attribute>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await AttributeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default AttributeService;
