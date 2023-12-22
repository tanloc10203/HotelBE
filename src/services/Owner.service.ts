import { Owner, OwnerModel } from "@/models";
import { BadRequestError, NotFoundRequestError, getInfoData } from "@/utils";
import { ObjectType } from "types";
import OwnerInfoService from "./OwnerInfo.service";

class OwnerService {
  static create = async (data: Owner) => {
    return await OwnerModel.create(data);
  };

  static update = async (data: Partial<Owner>, id: number) => {
    let Owner: Owner | boolean;

    if (!(await OwnerModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const [data, dataInfo] = await Promise.all([
      OwnerModel.findOne<Owner>({ id: id }),
      OwnerInfoService.findOne({ owner_id: id }),
    ]);

    if (!data || !dataInfo) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return {
      ...data,
      ...getInfoData(dataInfo, [
        "address",
        "birth_date",
        "desc",
        "first_name",
        "gender",
        "last_name",
      ]),
    };
  };

  static findOne = async (conditions: ObjectType<Owner>) => {
    return OwnerModel.findOne(conditions);
  };

  static getAll = async (filters: {}) => {
    return await OwnerModel.findAll<Owner>(filters);
  };

  static deleteById = async (id: number) => {
    if (!(await OwnerModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default OwnerService;
