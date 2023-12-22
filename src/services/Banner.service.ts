import { removeImageV2, resultUrlImage } from "@/lib";
import { Banner, BannerModel } from "@/models";
import { BannerInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUIDv2 } from "@/utils";
import { ObjectType, Pagination } from "types";

class BannerService {
  static create = async (data: string[]) => {
    return await BannerModel.createBulk(
      data.map((t) => [generateUUIDv2("BNID"), t, null]),
      true
    );
  };

  static update = async (data: BannerInputUpdate["body"], id: number) => {
    let Banner: Banner | boolean;

    if (!(await BannerModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await BannerModel.findOne<Banner>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await BannerModel.findAll<Banner>(filters, undefined, options);
    const total = await BannerModel.count(filters);
    if (!results.length) return { results: [], total: 0 };
    return { results: results.map((t) => ({ ...t, url: resultUrlImage(t.url) })), total };
  };

  static findOne = async (conditions: ObjectType<Banner>) => {
    return await BannerModel.findOne<Banner>(conditions);
  };

  static deleteById = async (id: string) => {
    const [deleted, banner] = await Promise.all([
      BannerModel.deleteById(id),
      BannerService.getById(id),
    ]);

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    await removeImageV2(banner.url);

    return true;
  };
}

export default BannerService;
