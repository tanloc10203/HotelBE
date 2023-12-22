import { resultUrlImage } from "@/lib";
import { ImagesRoomType, ImagesRoomTypeModel } from "@/models";
import { ImagesRoomTypeInputCreate, ImagesRoomTypeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class ImagesRoomTypeService {
  static create = async (data: ImagesRoomTypeInputCreate) => {
    return await ImagesRoomTypeModel.create(data);
  };

  static update = async (data: ImagesRoomTypeInputUpdate["body"], id: number) => {
    let ImagesRoomType: ImagesRoomType | boolean;

    if (!(await ImagesRoomTypeModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await ImagesRoomTypeModel.findOne<ImagesRoomType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options?: Pagination) => {
    const results = await ImagesRoomTypeModel.findAll<ImagesRoomType>(filters, undefined, options);
    const total = await ImagesRoomTypeModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const newData = results.map((r) => ({ ...r, src: resultUrlImage(r.src) }));

    return { results: newData, total };
  };

  static findOne = async (conditions: ObjectType<ImagesRoomType>) => {
    return await ImagesRoomTypeModel.findOne<ImagesRoomType>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await ImagesRoomTypeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ImagesRoomTypeService;
