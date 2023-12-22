import { Tax, TaxModel } from "@/models";
import { TaxInputCreate, TaxInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError, rawLike } from "@/utils";
import { ObjectType, Pagination } from "types";

class TaxService {
  static create = async (data: TaxInputCreate) => {
    const nameExist = await TaxService.findOne({ name: rawLike(data.name) });

    if (nameExist) throw new ConflictRequestError(`Tên thuế \`${data.name}\` đã tồn tại`);

    const created = await TaxModel.create(data);

    return created;
  };

  static update = async (data: TaxInputUpdate["body"], id: number) => {
    const nameExist = await TaxService.findOne({ name: rawLike(data.name) });

    if (nameExist && nameExist.id !== id)
      throw new ConflictRequestError(`Tên thuế \`${data.name}\` đã tồn tại`);

    const updated = await TaxModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await TaxModel.findOne<Tax>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await TaxModel.findAll<Tax>(filters, undefined, options);
    const total = await TaxModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Tax>) => {
    return await TaxModel.findOne<Tax>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await TaxModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default TaxService;
