import { InformationHotel, InformationHotelModel } from "@/models";
import { InformationHotelInputCreate, InformationHotelInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUIDv2 } from "@/utils";
import { ObjectType, Pagination } from "types";

class InformationHotelService {
  static create = async (data: InformationHotelInputCreate) => {
    return await InformationHotelModel.create({ ...data, id: generateUUIDv2("HID") });
  };

  static update = async (data: InformationHotelInputUpdate["body"], id: string) => {
    let InformationHotel: InformationHotel | boolean;

    if (!(await InformationHotelModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await InformationHotelModel.findOne<InformationHotel>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await InformationHotelModel.findAll<InformationHotel>(
      filters,
      undefined,
      options
    );
    const total = await InformationHotelModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results, total };
  };

  static findOne = async (conditions: ObjectType<InformationHotel>) => {
    return await InformationHotelModel.findOne<InformationHotel>(conditions);
  };
}

export default InformationHotelService;
