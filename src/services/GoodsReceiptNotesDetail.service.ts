import { GoodsReceiptNotesDetail, GoodsReceiptNotesDetailModel } from "@/models";
import { GoodsReceiptNotesDetailInputCreate, GoodsReceiptNotesDetailInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";
import ServiceService from "./Service.service";
import ServicesUnitService from "./ServicesUnit.service";

class GoodsReceiptNotesDetailService {
  static create = async (data: GoodsReceiptNotesDetailInputCreate) => {
    return await GoodsReceiptNotesDetailModel.create(data);
  };

  static update = async (data: GoodsReceiptNotesDetailInputUpdate["body"], id: number) => {
    let GoodsReceiptNotesDetail: GoodsReceiptNotesDetail | boolean;

    if (!(await GoodsReceiptNotesDetailModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await GoodsReceiptNotesDetailModel.findOne<GoodsReceiptNotesDetail>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await GoodsReceiptNotesDetailModel.findAll<GoodsReceiptNotesDetail>(
      filters,
      undefined,
      options
    );

    const total = await GoodsReceiptNotesDetailModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const { attributes, units, priceData, ...others } = await ServiceService.getById(
                row.product_id
              );

              if (!row.unit_product_id) {
                return resolve({ ...row, product: others, unit: null });
              }

              const unit = await ServicesUnitService.getById(row.unit_product_id);

              resolve({ ...row, product: others, unit });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<GoodsReceiptNotesDetail>) => {
    return await GoodsReceiptNotesDetailModel.findOne<GoodsReceiptNotesDetail>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await GoodsReceiptNotesDetailModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default GoodsReceiptNotesDetailService;
