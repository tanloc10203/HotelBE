import { Floor, FloorModel } from "@/models";
import { FloorInputCreate, FloorInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import RoomService from "./Room.service";

class FloorService {
  static create = async (data: FloorInputCreate) => {
    const [nameExist, characterExists] = await Promise.all([
      FloorService.findOne({ name: data.name }),
      FloorService.findOne({ character: data.character }),
    ]);

    if (nameExist) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại`);
    }

    if (characterExists) {
      throw new ConflictRequestError(`Kí tự \`${data.character}\` đã tồn tại`);
    }

    const lastInsertId = await FloorModel.create(data);

    return lastInsertId;
  };

  static update = async (data: FloorInputUpdate["body"], id: number) => {
    let [nameExist, characterExists]: Array<Floor | boolean> = await Promise.all([
      FloorService.findOne({ name: data.name }),
      FloorService.findOne({ character: data.character }),
    ]);

    if (nameExist && nameExist.id !== id) {
      throw new ConflictRequestError(`Tên \`${data.name}\` đã tồn tại`);
    }

    if (characterExists && characterExists.id !== id) {
      throw new ConflictRequestError(`Kí tự \`${data.character}\` đã tồn tại`);
    }

    const updated = await FloorModel.update(data, id);

    if (!updated) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await FloorModel.findOne<Floor>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await FloorModel.findAll<Floor>(filters, undefined, options);
    const total = await FloorModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<Floor>) => {
    return await FloorModel.findOne<Floor>(conditions);
  };

  static deleteById = async (id: number) => {
    const floorConstrains = await RoomService.findOne({ floor_id: id });

    if (floorConstrains) {
      throw new ForbiddenRequestError(
        `Bạn không được phép xóa. Tầng này đã bị ràng buộc bởi vị trí phòng nào đó.`
      );
    }

    const deleted = await FloorModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default FloorService;
