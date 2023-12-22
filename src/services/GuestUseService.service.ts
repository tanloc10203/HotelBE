import { Transaction } from "@/lib";
import { GuestUseService, GuestUseServiceModel, ServicesUnit, ServicesUnitModel } from "@/models";
import {
  GuestPlusMinusInput,
  GuestUseServiceInputCreate,
  GuestUseServiceInputUpdate,
} from "@/schema";
import {
  BadRequestError,
  InternalServerRequestError,
  NotFoundRequestError,
  generateUUIDv2,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import ServiceService from "./Service.service";
import ServicesUnitService from "./ServicesUnit.service";

type ResponseGetAll = {
  serviceData: Awaited<ReturnType<typeof ServiceService.getById>>;
  unitData: Awaited<ReturnType<typeof ServicesUnitService.getById>>;
  sub_total: number;
} & GuestUseService;

type UnitDataGetAll = Awaited<ReturnType<typeof ServicesUnitService.getAll>>["results"][0];

class GuestUseServiceService {
  static create = async (data: GuestUseServiceInputCreate) => {
    const [service, unit, guestUseService] = await Promise.all([
      ServiceService.getById(data.service_id),
      ServicesUnitService.getById(data.service_unit_id),
      GuestUseServiceService.findOne({
        booking_details_id: data.booking_details_id,
        service_id: data.service_id,
        service_unit_id: data.service_unit_id,
      }),
    ]);

    // console.log("====================================");
    // console.log(`data`, { data, service: service.units, unit, guestUseService });
    // console.log("====================================");

    // throw new InternalServerRequestError(`Maintain system`);

    const isProduct = Boolean(service.is_product === 1);
    const priceSell =
      Number(unit.quantity_in_stock) > 1
        ? Number(unit.quantity) * Number(service.priceData!.price_sell)
        : Number(service.priceData!.price_sell);

    let unitDefault: UnitDataGetAll | null = null;
    let quantityProductIsBig = false;

    if (isProduct) {
      if (!unit.is_default && unit.quantity !== 1) {
        quantityProductIsBig = true;
        const unitData = [...(service?.units || [])];

        const _unitDefault = unitData.find((t) => t.is_default);

        if (!_unitDefault) throw new BadRequestError(`Không tìm thấy đơn vị mặc định.`);

        unitDefault = _unitDefault;

        const totalStock = Math.floor(
          Number(_unitDefault.quantity_in_stock) / Number(unit.quantity)
        );

        // console.log("====================================");
        // console.log(`totalStock`, totalStock);
        // console.log("====================================");

        if (data.quantity_ordered > totalStock) {
          throw new BadRequestError(`Đã vượt quá số lượng trong kho.`);
        }
      } else {
        if (
          data.quantity_ordered > Number(unit.quantity_in_stock) ||
          (guestUseService &&
            Number(guestUseService.quantity_ordered) + data.quantity_ordered >
              Number(unit.quantity_in_stock))
        )
          throw new BadRequestError(`Đã vượt quá số lượng trong kho.`);
      }
    }

    // console.log("====================================");
    // console.log(`quantityProductIsBig`, quantityProductIsBig);
    // console.log("====================================");

    // throw new InternalServerRequestError(`Maintain system`);

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const id = generateUUIDv2("GSID");

    const quantity_ordered = guestUseService
      ? Number(guestUseService.quantity_ordered) + Number(data.quantity_ordered)
      : Number(data.quantity_ordered);

    try {
      await connection.beginTransaction();

      if (!guestUseService) {
        await transaction.create<GuestUseService>({
          data: {
            id,
            booking_details_id: data.booking_details_id,
            price: priceSell,
            quantity_ordered: quantity_ordered,
            service_id: data.service_id,
            service_unit_id: data.service_unit_id,
            note: data.note || null,
            discount: Number(data.discount),
            guest_id: data.guest_id || null,
          },
          pool: connection,
          table: GuestUseServiceModel.getTable,
        });
      } else {
        await transaction.update<Partial<GuestUseService>, Partial<GuestUseService>>({
          data: { quantity_ordered },
          pool: connection,
          table: GuestUseServiceModel.getTable,
          key: "id",
          valueOfKey: guestUseService.id!,
        });
      }

      if (isProduct) {
        if (quantityProductIsBig && unitDefault && unit.quantity !== 1) {
          await Promise.all([
            transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
              data: { quantity_in_stock: Number(unit.quantity_in_stock) - data.quantity_ordered },
              pool: connection,
              table: ServicesUnitModel.getTable,
              key: "id",
              valueOfKey: unit.id!,
            }),
            transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
              data: { quantity_in_stock: Number(unitDefault.quantity_in_stock) - unit.quantity! },
              pool: connection,
              table: ServicesUnitModel.getTable,
              key: "id",
              valueOfKey: unitDefault.id!,
            }),
          ]);
        } else {
          const children = service.units.find((t) => t.quantity !== 1);

          const quantityInStock = Number(unit.quantity_in_stock) - data.quantity_ordered;

          if (children) {
            const totalStock = Math.floor(quantityInStock / Number(children.quantity));

            if (totalStock < Number(children.quantity_in_stock)) {
              await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
                data: { quantity_in_stock: Number(children.quantity_in_stock) - 1 },
                pool: connection,
                table: ServicesUnitModel.getTable,
                key: "id",
                valueOfKey: children.id!,
              });
            }
          }

          await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
            data: { quantity_in_stock: quantityInStock },
            pool: connection,
            table: ServicesUnitModel.getTable,
            key: "id",
            valueOfKey: unit.id!,
          });
        }
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    const response = await GuestUseServiceService.getAll(
      { booking_details_id: data.booking_details_id },
      { order: "created_at" }
    );

    return response.results;
  };

  static update = async (data: GuestUseServiceInputUpdate["body"], id: string) => {
    let GuestUseService: GuestUseService | boolean;

    if (!(await GuestUseServiceModel.update(data, id))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: string) => {
    const data = await GuestUseServiceModel.findOne<GuestUseService>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const [service, unit] = await Promise.all([
      ServiceService.getById(data.service_id),
      ServicesUnitService.getById(data.service_unit_id),
    ]);
    const discount = Number(data.discount || 0);

    const sub_total =
      (data.price - (discount > 100 ? discount : data.price * discount)) * data.quantity_ordered;

    return { ...data, serviceData: service, unitData: unit, sub_total };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await GuestUseServiceModel.findAll<GuestUseService>(
      filters,
      undefined,
      options
    );
    const total = await GuestUseServiceModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const response = await Promise.all(
      results.map(
        (row): Promise<ResponseGetAll> =>
          new Promise(async (resolve, reject) => {
            try {
              const [service, unit] = await Promise.all([
                ServiceService.getById(row.service_id),
                ServicesUnitService.getById(row.service_unit_id),
              ]);
              const discount = Number(row.discount || 0);

              const sub_total =
                (row.price - (discount > 100 ? discount : row.price * discount)) *
                row.quantity_ordered;

              resolve({ ...row, serviceData: service, unitData: unit, sub_total });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: response, total };
  };

  static findOne = async (conditions: ObjectType<GuestUseService>) => {
    return await GuestUseServiceModel.findOne<GuestUseService>(conditions);
  };

  static deleteById = async (id: string) => {
    const { quantity_ordered, service_unit_id, unitData, serviceData, booking_details_id } =
      await GuestUseServiceService.getById(id);

    console.log("====================================");

    const isProduct = Boolean(serviceData.is_product === 1);

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    console.log(`unitDefault`, {
      serviceData,
      quantity_ordered,
      unitData,
    });

    try {
      await connection.beginTransaction();

      if (isProduct) {
        if (!unitData.is_default && unitData.quantity !== 1) {
          const unitDefault = serviceData.units.find((t) => t.is_default);

          const quantityRollback =
            Number(unitDefault?.quantity_in_stock) +
            Number(quantity_ordered) * Number(unitData.quantity);

          console.log("====================================");
          console.log(`unitDefault`, {
            unitDefault,
            serviceData,
            quantity_ordered,
            unitData,
            quantityRollback,
          });
          console.log("====================================");

          // throw new InternalServerRequestError(`Maintain system`);

          await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
            data: {
              quantity_in_stock: quantityRollback,
            },
            key: "id",
            pool: connection,
            table: ServicesUnitModel.getTable,
            valueOfKey: unitDefault?.id!,
          });
        }

        if (unitData.is_default) {
          const children = serviceData.units.find((t) => t.quantity !== 1);

          const quantityInStock = Number(unitData.quantity_in_stock) + quantity_ordered;

          if (children) {
            const totalStock = Math.floor(quantityInStock / Number(children.quantity));

            if (totalStock > Number(children.quantity_in_stock)) {
              await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
                data: { quantity_in_stock: Number(children.quantity_in_stock) + 1 },
                pool: connection,
                table: ServicesUnitModel.getTable,
                key: "id",
                valueOfKey: children.id!,
              });
            }
          }
        }

        await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
          data: {
            quantity_in_stock: Number(unitData.quantity_in_stock) + Number(quantity_ordered),
          },
          key: "id",
          pool: connection,
          table: ServicesUnitModel.getTable,
          valueOfKey: unitData.id!,
        });
      }

      await transaction.delete<GuestUseService>({
        conditions: { id: id },
        pool: connection,
        table: GuestUseServiceModel.getTable,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    const response = await GuestUseServiceService.getAll(
      { booking_details_id: booking_details_id },
      { order: "created_at" }
    );

    return response.results;
  };

  /**
   * quantity changed
   * @param param0
   * @param id
   */
  static plusMinus = async ({ options, quantity }: GuestPlusMinusInput["body"], id: string) => {
    const guestUseService = await GuestUseServiceService.getById(id);
    const { serviceData, unitData, quantity_ordered, service_unit_id, booking_details_id } =
      guestUseService;

    const isProduct = Boolean(serviceData.is_product === 1);
    let quantityInStock = Number(unitData.quantity_in_stock);

    if (quantity <= 0) {
      const response = await GuestUseServiceService.deleteById(id);
      return response;
    }

    if (isProduct) {
      if (options === "plus" && quantity > quantityInStock)
        throw new BadRequestError(`Đã vượt quá số lượng trong kho.`);

      quantityInStock =
        options === "minus"
          ? quantityInStock + (quantity_ordered - quantity)
          : quantityInStock - (quantity - quantity_ordered);
    }

    console.log("====================================");
    console.log(`quantityInStock`, { quantityInStock, quantity, quantity_ordered });
    console.log("====================================");

    // throw new InternalServerRequestError(`Maintain system`);

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      if (isProduct) {
        if (!unitData.is_default && unitData.quantity !== 1) {
          const unitDefault = serviceData.units.find((t) => t.is_default);

          let quantityRollback = 0;

          if (options === "minus") {
            quantityRollback = Number(unitDefault?.quantity_in_stock) + Number(unitData.quantity);
          } else {
            quantityRollback = Number(unitDefault?.quantity_in_stock) - Number(unitData.quantity);
          }

          console.log("====================================");
          console.log(`unitDefault`, {
            unitDefault,
            serviceData,
            quantity_ordered,
            unitData,
            quantityRollback,
            options,
          });
          console.log("====================================");

          // throw new InternalServerRequestError(`Maintain system`);

          await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
            data: {
              quantity_in_stock: quantityRollback,
            },
            key: "id",
            pool: connection,
            table: ServicesUnitModel.getTable,
            valueOfKey: unitDefault?.id!,
          });
        }

        if (unitData.is_default) {
          const children = serviceData.units.find((t) => t.quantity !== 1);

          const _quantityInStock = Number(unitData.quantity_in_stock) + quantityInStock;

          if (children) {
            const totalStock = Math.floor(_quantityInStock / Number(children.quantity));

            if (totalStock > Number(children.quantity_in_stock)) {
              await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
                data: { quantity_in_stock: Number(children.quantity_in_stock) + 1 },
                pool: connection,
                table: ServicesUnitModel.getTable,
                key: "id",
                valueOfKey: children.id!,
              });
            }
          }
        }

        await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
          data: {
            quantity_in_stock: quantityInStock,
          },
          key: "id",
          pool: connection,
          table: ServicesUnitModel.getTable,
          valueOfKey: unitData.id!,
        });
      }

      await transaction.update<Partial<GuestUseService>, Partial<GuestUseService>>({
        data: { quantity_ordered: quantity },
        pool: connection,
        table: GuestUseServiceModel.getTable,
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

    const response = await GuestUseServiceService.getAll(
      { booking_details_id: booking_details_id },
      { order: "created_at" }
    );

    return response.results;
  };
}

export default GuestUseServiceService;
