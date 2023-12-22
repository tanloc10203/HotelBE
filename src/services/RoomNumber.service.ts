import { RoomNumber, RoomNumberModel } from "@/models";
import { RoomNumberInputCreate, RoomNumberInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  isNotNull,
  isNull,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import RoomService from "./Room.service";

class RoomNumberService {
  static create = async (data: RoomNumberInputCreate) => {
    if (await RoomNumberModel.findOne<RoomNumber>({ id: data.id })) {
      throw new ConflictRequestError("id đã tồn tại...");
    }

    return await RoomNumberModel.create(data);
  };

  static update = async (data: RoomNumberInputUpdate["body"], id: string) => {
    let RoomNumber: RoomNumber | boolean;

    RoomNumber = await RoomNumberModel.findOne<RoomNumber>({ id: data.id });

    if (RoomNumber && RoomNumber.id !== id) {
      throw new ConflictRequestError("id đã tồn tại...");
    }

    if (!(await RoomNumberModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await RoomNumberModel.findOne<RoomNumber>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getRoom = async (id: string) => {
    const data = await RoomNumberService.findOne({ id: id });

    if (!data) return null;

    const room = await RoomService.findOne({ id: data.room_id });

    if (!room) return null;

    return room;
  };

  static getByRoomId = async (roomId: number, deletedAtIsNull = true) => {
    const response = await RoomNumberService.getAll(
      { room_id: roomId, ...(deletedAtIsNull ? { deleted_at: isNull() } : {}) },
      {}
    );

    return response.results;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await RoomNumberModel.findAll<RoomNumber>(filters, undefined, options);
    const total = await RoomNumberModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<RoomNumber>) => {
    return await RoomNumberModel.findOne<RoomNumber>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await RoomNumberModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default RoomNumberService;
