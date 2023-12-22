import { ApiKey, ApiKeyModel } from "@/models";
import { ApiKeyInputCreate, ApiKeyInputUpdate } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  generateApiKey,
} from "@/utils";
import { ObjectType } from "types";

class ApiKeyService {
  static create = async (data: Omit<ApiKey, "key">) => {
    const key = generateApiKey();
    const response = await ApiKeyModel.create<ApiKey>({ ...data, key });
    return key;
  };

  static update = async (data: Partial<ApiKey>, id: number, key?: keyof ApiKey) => {
    let ApiKey: ApiKey | boolean;

    ApiKey = await ApiKeyModel.findOne<ApiKey>({ key: data.key });

    if (ApiKey && ApiKey.id !== id) {
      throw new ConflictRequestError("key đã tồn tại...");
    }

    if (!(await ApiKeyModel.update(data, id, key))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await ApiKeyModel.findOne<ApiKey>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static findOne = async (conditions: ObjectType<ApiKey>) => {
    const data = await ApiKeyModel.findOne<ApiKey>(conditions);
    return data;
  };

  static getAll = async (filters: {}) => {
    return await ApiKeyModel.findAll<ApiKey>(filters);
  };

  static deleteById = async (id: number) => {
    if (!(await ApiKeyModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ApiKeyService;
