import { Transaction, removeImageV2, resultUrlImage } from "@/lib";
import {
  Service,
  ServiceModel,
  ServicesAttribute,
  ServicesAttributeModel,
  ServicesPrice,
  ServicesPriceModel,
  ServicesUnit,
  ServicesUnitModel,
} from "@/models";
import { ConflictRequestError, NotFoundRequestError, generateUUIDv2, rawLike } from "@/utils";
import { ObjectType, Pagination } from "types";
import ServicesAttributeService from "./ServicesAttribute.service";
import ServicesPriceService from "./ServicesPrice.service";
import ServicesUnitService from "./ServicesUnit.service";

export type UnitsType = {
  id?: string;
  is_sell: boolean;
  unit_id: number;
  price?: number;
  quantity?: number;
  is_default?: boolean;
};

export type AttributeType = {
  attribute_id: string;
  value: string;
  quantity: number;
};

type ServicePayload = {
  service_type_id: string;
  name: string;
  price_id?: string;
  timer?: number | null;
  desc?: string | null;
  note?: string | null;
  price_original?: number;
  price_sell: number;
  units: UnitsType[];
  photo_public?: string | null;
};

type ServiceProductAddInput = {
  service_type_id: string;
  name: string;
  price_id?: string;
  price_original: number;
  price_sell: number;
  min_quantity_product: number;
  quantity: number;
  units: UnitsType[];
  attributes: AttributeType[];
  desc?: string;
  note?: string;
  photo_public?: string | null;
};

type ResponseGetAll = {
  units: Awaited<ReturnType<typeof ServicesUnitService.getAll>>["results"];
  attributes: Awaited<ReturnType<typeof ServicesAttributeService.getAll>>["results"];
  priceData: Awaited<ReturnType<typeof ServicesPriceService.findOne>>;
} & Service;

class ServiceService {
  static create = async (data: ServicePayload) => {
    const nameExists = await ServiceService.findOne({
      name: rawLike(data.name),
      service_type_id: data.service_type_id,
    });

    if (nameExists) {
      throw new ConflictRequestError(
        `Tên dịch vụ \`${data.name}\` đã tồn tại trong loại dịch vụ này`
      );
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();
      const serviceID = generateUUIDv2("SID");

      await transaction.create<Service>({
        data: {
          id: serviceID,
          name: data.name,
          service_type_id: data.service_type_id,
          desc: data.desc,
          note: data.note,
          timer: data.timer,
          photo_public: data.photo_public,
        },
        pool: connection,
        table: ServiceModel.getTable,
      });

      const unitsInsert = data.units.map((u) => {
        const unitServiceId = generateUUIDv2("USID");
        return [
          unitServiceId,
          serviceID,
          u.unit_id,
          u.quantity || 1,
          0,
          u.is_sell,
          u.price || data.price_original,
          1,
          null,
        ];
      });

      await Promise.all([
        transaction.createBulk({
          pool: connection,
          table: ServicesUnitModel.getTable,
          data: unitsInsert,
          fillables: ServicesUnitModel.getFillables,
          withId: true,
        }),
        transaction.create<ServicesPrice>({
          data: {
            id: generateUUIDv2("PRID"),
            service_id: serviceID,
            price_original: data.price_original!,
            price_sell: data.price_sell,
          },
          pool: connection,
          table: ServicesPriceModel.getTable,
        }),
      ]);

      return serviceID;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      transaction.releaseConnection(connection);
      connection.release();
    }
  };

  static createProduct = async (data: ServiceProductAddInput) => {
    const { attributes, units, ...othersData } = data;

    if (attributes.length) {
      await Promise.all(
        attributes.map(
          (attribute) =>
            new Promise(async (resolve, reject) => {
              try {
                const response = await ServiceModel.getExistsServiceProduct(
                  data.name,
                  data.service_type_id,
                  attribute.value
                );

                if (response.length) {
                  throw new ConflictRequestError(
                    `Hàng hóa \`${data.name}\` đã tồn tại với thuộc tính \`${attribute.value}\``
                  );
                }

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        )
      );
    } else {
      const nameExists = await ServiceService.findOne({
        service_type_id: data.service_type_id,
        // @ts-ignore
        name_like: data.name,
      });

      if (nameExists) {
        throw new ConflictRequestError(`Tên hàng hóa \`${data.name}\` đã tồn tại`);
      }
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();
      const productId = generateUUIDv2("PID");

      const productCreated = await transaction.create<Service>({
        data: {
          id: productId,
          name: data.name,
          service_type_id: data.service_type_id,
          is_product: true,
          min_quantity_product: data.min_quantity_product,
          note: data.note || null,
          quantity: data.quantity,
          timer: null,
          photo_public: data?.photo_public || null,
        },
        pool: connection,
        table: ServiceModel.getTable,
      });

      const unitsInsert = units.map((u) => {
        const id = generateUUIDv2("UPID");
        return [
          id,
          productId,
          u.unit_id,
          u.quantity || 1,
          data.quantity,
          u.is_sell,
          u.price || 0,
          u.is_default,
          null,
        ];
      });

      await Promise.all([
        transaction.createBulk({
          pool: connection,
          table: ServicesUnitModel.getTable,
          data: unitsInsert,
          fillables: ServicesUnitModel.getFillables,
          withId: true,
        }),
        transaction.create<ServicesPrice>({
          data: {
            id: generateUUIDv2("PRID"),
            service_id: productId,
            price_original: data.price_original,
            price_sell: data.price_sell,
          },
          pool: connection,
          table: ServicesPriceModel.getTable,
        }),
      ]);

      if (attributes.length) {
        const attributeInserts = attributes.map((attribute) => {
          const id = generateUUIDv2("ATSID");
          return [
            id,
            attribute.attribute_id,
            productCreated,
            attribute.quantity,
            attribute.value,
            null,
          ];
        });

        await transaction.createBulk({
          pool: connection,
          table: ServicesAttributeModel.getTable,
          data: attributeInserts,
          fillables: ServicesAttributeModel.getFillables,
          withId: true,
        });
      }

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

  static update = async (data: ServicePayload, id: string) => {
    const nameExists = await ServiceService.findOne({
      name: rawLike(data.name),
      service_type_id: data.service_type_id,
    });

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(
        `Tên dịch vụ \`${data.name}\` đã tồn tại trong loại dịch vụ này`
      );
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      if (data.photo_public) {
        if (nameExists && nameExists.photo_public) {
          await removeImageV2(nameExists.photo_public);
        }
      } else {
        delete data.photo_public;
      }

      const { units, price_sell, price_original, price_id, ...others } = data;

      await Promise.all([
        transaction.update<Partial<Service>, Partial<Service>>({
          data: others,
          key: "id",
          valueOfKey: id,
          pool: connection,
          table: ServiceModel.getTable,
        }),
        transaction.update<Partial<ServicesPrice>, Partial<ServicesPrice>>({
          data: { price_original, price_sell },
          key: "id",
          valueOfKey: price_id!,
          pool: connection,
          table: ServicesPriceModel.getTable,
        }),
        transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
          data: { ...units[0] },
          key: "id",
          valueOfKey: units[0].id!,
          pool: connection,
          table: ServicesUnitModel.getTable,
        }),
      ]);

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      transaction.releaseConnection(connection);
      connection.release();
    }
  };

  static updateProduct = async (data: ServiceProductAddInput, id: string) => {
    const { attributes, units, ...othersData } = data;

    if (attributes.length) {
      await Promise.all(
        attributes.map(
          (attribute) =>
            new Promise(async (resolve, reject) => {
              try {
                const response = await ServiceModel.getExistsServiceProduct(
                  data.name,
                  data.service_type_id,
                  attribute.value
                );

                if (response.length && !response.map((r) => r.service_id).includes(id)) {
                  throw new ConflictRequestError(
                    `Hàng hóa \`${data.name}\` đã tồn tại với thuộc tính \`${attribute.value}\``
                  );
                }

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        )
      );
    } else {
      const nameExists = await ServiceService.findOne({
        service_type_id: data.service_type_id,
        // @ts-ignore
        name_like: data.name,
      });

      if (nameExists && nameExists.id !== id) {
        throw new ConflictRequestError(`Tên hàng hóa \`${data.name}\` đã tồn tại`);
      }
    }

    const transaction = new Transaction();
    const [connection, product] = await Promise.all([
      transaction.getPoolTransaction(),
      ServiceService.getById(id),
    ]);

    try {
      if (data.photo_public) {
        if (product.photo_public) {
          await removeImageV2(product.photo_public);
        }
      } else {
        delete data.photo_public;
      }

      await connection.beginTransaction();

      const { units, price_sell, price_original, attributes, price_id, ...others } = data;

      await Promise.all([
        transaction.update<Partial<Service>, Partial<Service>>({
          data: others,
          key: "id",
          valueOfKey: id,
          pool: connection,
          table: ServiceModel.getTable,
        }),
        transaction.update<Partial<ServicesPrice>, Partial<ServicesPrice>>({
          data: { price_original, price_sell },
          key: "id",
          valueOfKey: price_id!,
          pool: connection,
          table: ServicesPriceModel.getTable,
        }),
      ]);

      if (attributes.length) {
        await transaction.delete<ServicesAttribute>({
          conditions: { service_id: id },
          pool: connection,
          table: ServicesAttributeModel.getTable,
        });

        const attributeInserts = attributes.map((attribute) => {
          const attributeId = generateUUIDv2("ATSID");

          return [
            attributeId,
            attribute.attribute_id,
            id,
            attribute.quantity,
            attribute.value,
            null,
          ];
        });

        await transaction.createBulk({
          pool: connection,
          table: ServicesAttributeModel.getTable,
          data: attributeInserts,
          fillables: ServicesAttributeModel.getFillables,
          withId: true,
        });
      }

      const { results: getUnits } = await ServicesUnitService.getAll({ service_id: id }, {});

      const filterUnitsRemove = getUnits.filter((u) => !units.map((r) => r.id!).includes(u.id!));

      console.log(`filterUnitsRemove`, filterUnitsRemove);

      if (filterUnitsRemove.length) {
        await Promise.all(
          filterUnitsRemove.map(
            (filter) =>
              new Promise(async (resolve, reject) => {
                try {
                  await transaction.delete<ServicesUnit>({
                    conditions: { id: filter.id! },
                    pool: connection,
                    table: ServicesUnitModel.getTable,
                  });
                  resolve(true);
                } catch (error) {
                  await connection.rollback();
                  reject(error);
                }
              })
          )
        );
      }

      await Promise.all(
        units.map(
          (unit) =>
            new Promise(async (resolve, reject) => {
              try {
                await transaction.update<Partial<ServicesUnit>, Partial<ServicesUnit>>({
                  data: unit,
                  key: "id",
                  valueOfKey: unit.id!,
                  pool: connection,
                  table: ServicesUnitModel.getTable,
                });
                resolve(true);
              } catch (error) {
                await connection.rollback();
                reject(error);
              }
            })
        )
      );

      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      transaction.releaseConnection(connection);
      connection.release();
    }
  };

  static getById = async (id: string) => {
    const data = await ServiceModel.findOne<Service>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const { results: units } = await ServicesUnitService.getAll({ service_id: id }, {});
    const { results: attributes } = await ServicesAttributeService.getAll({ service_id: id }, {});
    const priceData = await ServicesPriceService.findOne({ service_id: id });

    return {
      ...data,
      photo_public: data?.photo_public ? resultUrlImage(data.photo_public) : "",
      units,
      attributes,
      priceData: priceData || null,
    };
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await ServiceModel.findAll<Service>(filters, undefined, options);
    const total = await ServiceModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<ResponseGetAll> =>
          new Promise(async (resolve, reject) => {
            try {
              const { results: units } = await ServicesUnitService.getAll(
                { service_id: row.id },
                { order: "is_default,desc" }
              );
              const { results: attributes } = await ServicesAttributeService.getAll(
                { service_id: row.id },
                {}
              );
              const priceData = await ServicesPriceService.findOne({ service_id: row.id });

              resolve({
                ...row,
                units,
                attributes,
                priceData,
                photo_public: row.photo_public ? resultUrlImage(row.photo_public) : "",
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<Service>) => {
    return await ServiceModel.findOne<Service>(conditions);
  };

  static deleteById = async (id: string) => {
    if (!(await ServiceModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default ServiceService;
