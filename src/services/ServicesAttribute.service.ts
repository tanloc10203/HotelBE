import { ServicesAttribute, ServicesAttributeModel } from "@/models";
import { ServicesAttributeInputCreate, ServicesAttributeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import AttributeService from "./Attribute.service";

class ServicesAttributeService {
  static create = async (data: ServicesAttributeInputCreate) => {
    return await ServicesAttributeModel.create(data);
  };

  static update = async (data: ServicesAttributeInputUpdate["body"], id: number) => {
    let ServicesAttribute: ServicesAttribute | boolean;

    if (!(await ServicesAttributeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await ServicesAttributeModel.findOne<ServicesAttribute>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ServicesAttributeModel.findAll<ServicesAttribute>(
      filters,
      undefined,
      options
    );
    const total = await ServicesAttributeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (
          row
        ): Promise<
          ServicesAttribute & {
            attributeData: Awaited<ReturnType<typeof AttributeService.findOne>>;
          }
        > =>
          new Promise(async (resolve, reject) => {
            try {
              const attributeData = await AttributeService.findOne({ id: row.attribute_id });

              resolve({ ...row, attributeData });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<ServicesAttribute>) => {
    return await ServicesAttributeModel.findOne<ServicesAttribute>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ServicesAttributeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ServicesAttributeService;
