import { Transaction } from "@/lib";
import { GuestStayInformation, GuestStayInformationModel } from "@/models";
import { GuestStayInformationInputCreate, GuestStayInformationInputUpdate } from "@/schema";
import { ConflictRequestError, NotFoundRequestError, generateUUID } from "@/utils";
import { ObjectType, Pagination } from "types";
import RoomNumberService from "./RoomNumber.service";

class GuestStayInformationService {
  static create = async (data: GuestStayInformationInputCreate) => {
    const { filters, ...dataGuest } = data;

    const [identity, quantity, room] = await Promise.all([
      GuestStayInformationService.findOne({
        room_number: dataGuest.room_number,
        booking_details_id: dataGuest.booking_details_id,
        identification_type: dataGuest.identification_type,
        identification_value: dataGuest.identification_value,
      }),
      GuestStayInformationModel.count({
        room_number: dataGuest.room_number,
        booking_details_id: dataGuest.booking_details_id,
      }),
      RoomNumberService.getRoom(dataGuest.room_number),
    ]);

    if (Number(quantity) + 1 > Number(room?.adults)) {
      throw new ConflictRequestError(`Số giấy tờ đã vượt quá số lượng khách trong phòng`);
    }

    if (identity) {
      throw new ConflictRequestError(
        `Số giấy tờ \`${dataGuest.identification_value}\` đã  bị trùng`
      );
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await transaction.create<GuestStayInformation>({
        data: { ...dataGuest, id: generateUUID("GID") },
        pool: connection,
        table: GuestStayInformationModel.getTable,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    const response = await GuestStayInformationService.getAll(
      {
        booking_details_id: dataGuest.booking_details_id,
        room_number: dataGuest.room_number,
      },
      { order: "created_at,asc" }
    );

    return response.results;
  };

  static update = async (data: GuestStayInformationInputUpdate["body"], id: string) => {
    const identity = await GuestStayInformationService.findOne({
      room_number: data.room_number,
      booking_details_id: data.booking_details_id,
      identification_type: data.identification_type,
      identification_value: data.identification_value,
    });

    if (identity && identity.id !== id) {
      throw new ConflictRequestError(`Số giấy tờ \`${data.identification_value}\` đã  bị trùng`);
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await transaction.update<Partial<GuestStayInformation>, GuestStayInformation>({
        data: { ...data },
        pool: connection,
        table: GuestStayInformationModel.getTable,
        key: "id",
        valueOfKey: id,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    const response = await GuestStayInformationService.getAll(
      {
        booking_details_id: data.booking_details_id,
        room_number: data.room_number,
      },
      { order: "created_at,asc" }
    );

    return response.results;
  };

  static getById = async (id: number) => {
    const data = await GuestStayInformationModel.findOne<GuestStayInformation>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await GuestStayInformationModel.findAll<GuestStayInformation>(
      filters,
      undefined,
      options
    );
    const total = await GuestStayInformationModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<GuestStayInformation>) => {
    return await GuestStayInformationModel.findOne<GuestStayInformation>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await GuestStayInformationModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default GuestStayInformationService;
