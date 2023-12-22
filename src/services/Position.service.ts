import { Position, PositionModel } from "@/models";
import { PositionInputCreate, PositionInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
} from "@/utils";
import { ObjectType } from "types";
import OperationService from "./Operation.service";
import { raw } from "mysql2";

class PositionService {
  static create = async (data: PositionInputCreate) => {
    const positionExist = await PositionService.findOne({ name: data.name });

    if (positionExist) {
      throw new ConflictRequestError(`Tên chức vụ \`${data.name}\` đã tồn tại`);
    }

    const lastInsertId = await PositionModel.create(data);

    const dataAfterInsert = await PositionService.getById(lastInsertId);

    return dataAfterInsert;
  };

  static update = async (data: PositionInputUpdate["body"], id: number) => {
    let Position: Position | boolean = await PositionService.findOne({ name: data.name });

    if (Position && Position.id !== id) {
      throw new ConflictRequestError(`Tên chức vụ \`${data.name}\` đã tồn tại`);
    }

    Position = await PositionModel.update(data, id);

    if (!Position) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    const dataAfterUpdate = await PositionService.getById(id);

    return dataAfterUpdate;
  };

  static getById = async (id: number) => {
    const data = await PositionModel.findOne<Position>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>) => {
    if (filters?.name) {
      filters.name = raw(`LIKE '%${filters.name}%'`);
    }

    return await PositionModel.findAll<Position>(filters);
  };

  static findOne = async (conditions: ObjectType<Position>) => {
    return await PositionModel.findOne<Position>(conditions);
  };

  static deleteById = async (id: number) => {
    const findPosition = await OperationService.findOne({ position_id: id });

    if (findPosition) {
      throw new ForbiddenRequestError(
        `Bạn không được phép xóa. Vị trí này đang ràng buộc bởi nhân viên nào đó`
      );
    }

    const deleted = await PositionModel.deleteById(id);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default PositionService;
