import { Transaction } from "@/lib";
import {
  GoodsReceiptNote,
  GoodsReceiptNoteModel,
  GoodsReceiptNoteStatus,
  GoodsReceiptNotesDetailModel,
  ServicesUnit,
  ServicesUnitModel,
} from "@/models";
import { GoodsReceiptNoteInputCreate, GoodsReceiptNoteInputUpdate } from "@/schema";
import { BadRequestError, NotFoundRequestError, generateUUIDv2, getInfoData } from "@/utils";
import { ObjectType, Pagination } from "types";
import ServicesUnitService from "./ServicesUnit.service";
import SupplierService from "./Supplier.service";
import EmployeeService from "./Employee.service";
import GoodsReceiptNotesDetailService from "./GoodsReceiptNotesDetail.service";

class GoodsReceiptNoteService {
  static create = async (data: GoodsReceiptNoteInputCreate) => {
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      const { products, ...others } = data;

      const GoodsReceiptNoteId = generateUUIDv2("GRID");
      let status: GoodsReceiptNoteStatus = "unpaid";
      const { total_cost_paymented, total_cost } = others;

      if (total_cost_paymented - total_cost >= 0) {
        status = "paid";
      }

      if (total_cost_paymented > 0 && total_cost_paymented < total_cost) {
        status = "partially_paid";
      }

      await transaction.create<GoodsReceiptNote>({
        data: {
          ...others,
          status,
          id: GoodsReceiptNoteId,
        },
        pool: connection,
        table: GoodsReceiptNoteModel.getTable,
      });

      const GoodsReceiptNoteDetailsInserts = products.map((product) => {
        const GdID = generateUUIDv2("GDID");

        return [
          GdID,
          GoodsReceiptNoteId,
          product.product_id,
          product.unit_service_id,
          product.quantity_import,
          product.subTotal_import,
          product.price_origin,
          null,
          null,
          null,
        ];
      });

      await Promise.all([
        transaction.createBulk({
          pool: connection,
          table: GoodsReceiptNotesDetailModel.getTable,
          data: GoodsReceiptNoteDetailsInserts,
          fillables: GoodsReceiptNotesDetailModel.getFillables,
          withId: true,
        }),
        ...products.map(
          (product) =>
            new Promise(async (resolve, reject) => {
              try {
                const unitService = await ServicesUnitService.getById(product.unit_service_id);

                if (Number(unitService.quantity) > 1) {
                  const units = await ServicesUnitService.getAll(
                    {
                      service_id: unitService.service_id,
                    },
                    {}
                  );

                  await Promise.all(
                    units.results.map(
                      (u) =>
                        new Promise(async (resolveV2, rejectV2) => {
                          try {
                            await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
                              data: {
                                quantity_in_stock:
                                  Number(u.quantity_in_stock!) +
                                  Number(unitService.quantity) * Number(product.quantity_import),
                              },
                              key: "id",
                              pool: connection,
                              table: ServicesUnitModel.getTable,
                              valueOfKey: u.id!,
                            });

                            resolveV2(true);
                          } catch (error) {
                            await connection.rollback();
                            rejectV2(error);
                          }
                        })
                    )
                  );
                }

                await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
                  data: {
                    quantity_in_stock:
                      Number(unitService.quantity_in_stock!) + Number(product.quantity_import),
                  },
                  key: "id",
                  pool: connection,
                  table: ServicesUnitModel.getTable,
                  valueOfKey: product.unit_service_id,
                });
                resolve(true);
              } catch (error) {
                await connection.rollback();
                reject(error);
              }
            })
        ),
      ]);

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static update = async (data: GoodsReceiptNoteInputUpdate["body"], id: number) => {
    let GoodsReceiptNote: GoodsReceiptNote | boolean;

    if (!(await GoodsReceiptNoteModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const data = await GoodsReceiptNoteModel.findOne<GoodsReceiptNote>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    const results = await GoodsReceiptNoteModel.findAll<GoodsReceiptNote>(
      filters,
      undefined,
      options
    );

    const total = await GoodsReceiptNoteModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const supplier = await SupplierService.getById(row.supplier_id);
              const employee = await EmployeeService.getById(row.employee_id);
              const details = await GoodsReceiptNotesDetailService.getAll(
                { goods_receipt_note_id: row.id },
                {}
              );

              resolve({
                ...row,
                supplier,
                employee: getInfoData(employee, ["display_name", "phone_number", "photo", "id"]),
                details: details.results,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<GoodsReceiptNote>) => {
    return await GoodsReceiptNoteModel.findOne<GoodsReceiptNote>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await GoodsReceiptNoteModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default GoodsReceiptNoteService;
