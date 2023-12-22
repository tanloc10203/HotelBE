import { Transaction, removeImageV2 } from "@/lib";
import {
  AmenityRoomType,
  AmenityRoomTypeModel,
  Discount,
  EquipmentRoomType,
  EquipmentRoomTypeModel,
  ImagesRoomType,
  ImagesRoomTypeModel,
  RoomPrice,
  RoomPriceModel,
  RoomType,
  RoomTypeModel,
} from "@/models";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
  dateTimeSql,
  isNotNull,
  isNull,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import AmenityRoomTypeService from "./AmenityRoomType.service";
import EquipmentRoomTypeService from "./EquipmentRoomType.service";
import ImagesRoomTypeService from "./ImagesRoomType.service";
import PriceListService from "./PriceList.service";
import RoomService from "./Room.service";
import { GetAllStateRoomPrice } from "./RoomPrice.service";

type ObjectPayload = {
  name: string;
  character: string;
  desc: string;
  equipments: { id: number }[];
  amenities: { id: number }[];
};

type Create = ObjectPayload & {
  images: string[];
};

type Update = ObjectPayload & {
  removeImages?: { id: number }[];
  images?: string[];
};

type GetAllState = {
  amenities: Awaited<ReturnType<typeof AmenityRoomTypeService.getByRoomTypeId>>;
  equipments: Awaited<ReturnType<typeof EquipmentRoomTypeService.getByRoomTypeId>>;
  prices: GetAllStateRoomPrice["prices"] | null | undefined;
  images: Awaited<ReturnType<typeof ImagesRoomTypeService.getAll>>["results"];
  discount?: Discount | null;
} & RoomType;

class RoomTypeService {
  static create = async (data: Create) => {
    const [nameExists, characterExists] = await Promise.all([
      RoomTypeModel.findOne<RoomType>({ name: data.name }),
      RoomTypeModel.findOne<RoomType>({ character: data.character }),
    ]);

    if (nameExists) {
      throw new ConflictRequestError(`Tên loại phòng \`${data.name}\` đã tồn tại...`);
    }

    if (characterExists) {
      throw new ConflictRequestError(`Kí tự loại phòng \`${data.character}\` đã tồn tại...`);
    }

    const { amenities, equipments, images, ...others } = data;

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      const created = await transaction.create<RoomType>({
        data: others,
        pool: connection,
        table: RoomTypeModel.getTable,
      });

      const amenitiesInsert = amenities.map((amenitie) => [amenitie.id, created]);
      const equipmentsInsert = equipments.map((equipment) => [equipment.id, created]);
      const imagesInsert = images.map((image) => [created, image]);

      await Promise.all([
        transaction.createBulk({
          data: amenitiesInsert,
          fillables: AmenityRoomTypeModel.getFillables,
          pool: connection,
          table: AmenityRoomTypeModel.getTable,
        }),
        transaction.createBulk({
          data: equipmentsInsert,
          fillables: EquipmentRoomTypeModel.getFillables,
          pool: connection,
          table: EquipmentRoomTypeModel.getTable,
        }),
        transaction.createBulk({
          data: imagesInsert,
          fillables: ImagesRoomTypeModel.getFillables,
          pool: connection,
          table: ImagesRoomTypeModel.getTable,
        }),
      ]);

      return created;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static update = async (data: Update, id: number) => {
    const [nameExists, characterExists, roomTypeOld] = await Promise.all([
      RoomTypeModel.findOne<RoomType>({ name: data.name }),
      RoomTypeModel.findOne<RoomType>({ character: data.character }),
      RoomTypeService.getById(id),
    ]);

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Tên loại phòng \`${data.name}\` đã tồn tại...`);
    }

    if (characterExists && characterExists.id !== id) {
      throw new ConflictRequestError(`Kí tự loại phòng \`${data.character}\` đã tồn tại...`);
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const { amenities, equipments, images, removeImages, ...others } = data;

    const amenitiesInsert = amenities.map((amenitie) => [amenitie.id, id]);
    const equipmentsInsert = equipments.map((equipment) => [equipment.id, id]);

    try {
      await Promise.all([
        transaction.delete({
          conditions: { room_type_id: id },
          pool: connection,
          table: AmenityRoomTypeModel.getTable,
        }),
        transaction.delete({
          conditions: { room_type_id: id },
          pool: connection,
          table: EquipmentRoomTypeModel.getTable,
        }),
      ]);

      const updated = await transaction.update({
        data: others,
        pool: connection,
        table: RoomTypeModel.getTable,
        key: "id",
        valueOfKey: id,
      });

      if (!updated) {
        throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
      }

      await Promise.all([
        transaction.createBulk({
          data: amenitiesInsert,
          fillables: AmenityRoomTypeModel.getFillables,
          pool: connection,
          table: AmenityRoomTypeModel.getTable,
        }),
        transaction.createBulk({
          data: equipmentsInsert,
          fillables: EquipmentRoomTypeModel.getFillables,
          pool: connection,
          table: EquipmentRoomTypeModel.getTable,
        }),
      ]);

      if (images) {
        const imagesInsert = images.map((image) => [id, image]);
        await transaction.createBulk({
          data: imagesInsert,
          fillables: ImagesRoomTypeModel.getFillables,
          pool: connection,
          table: ImagesRoomTypeModel.getTable,
        });
      }

      if (removeImages && removeImages.length) {
        await Promise.all(
          removeImages.map(
            (image) =>
              new Promise(async (resolve, reject) => {
                try {
                  await ImagesRoomTypeService.deleteById(image.id);
                  resolve(true);
                } catch (error) {
                  reject(error);
                }
              })
          )
        );
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

  static getById = async (id: number) => {
    const data = await RoomTypeModel.findOne<RoomType>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    const [amenities, equipments, images, pricesList, priceListDiscount] = await Promise.all([
      AmenityRoomTypeService.getByRoomTypeId(id),
      EquipmentRoomTypeService.getByRoomTypeId(id),
      ImagesRoomTypeService.getAll({ room_type_id: id }),
      PriceListService.getAll({ type: "room", is_default: 1 }, {}),
      PriceListService.getAll({ type: "discount", is_default: 1 }, {}),
    ]);

    const { roomTypes } = pricesList?.results[0];
    const price = roomTypes?.find((t) => t?.id === id);

    let discount: Discount | undefined | null = null;

    if (priceListDiscount.results.length) {
      const ds = priceListDiscount.results[0].roomTypes?.find((t) => t?.id === id);

      if (ds) {
        discount = ds.discount;
      }
    }

    return {
      ...data,
      amenities,
      equipments,
      prices: price?.prices,
      discount,
      images: images.results?.length ? images.results : [],
    };
  };

  static getAll = async (
    filters: Record<string, any>,
    options: Partial<Pagination>,
    isNotRelationship = false
  ) => {
    if (filters?.delete_not_null) {
      filters = { ...filters, deleted_at: isNotNull() };

      delete filters.delete_not_null;
    }

    filters = { deleted_at: isNull(), ...filters };

    const results = await RoomTypeModel.findAll<RoomType>(filters, undefined, options);

    if (!results.length) return { results: [], total: 0 };

    const total = await RoomTypeModel.count(filters);

    if (isNotRelationship) {
      return { results, total };
    }

    const data = await Promise.all(
      results.map(
        (row): Promise<GetAllState> =>
          new Promise(async (resolve, reject) => {
            try {
              const [amenities, equipments, images, pricesList, priceListDiscount] =
                await Promise.all([
                  AmenityRoomTypeService.getByRoomTypeId(row.id!),
                  EquipmentRoomTypeService.getByRoomTypeId(row.id!),
                  ImagesRoomTypeService.getAll({ room_type_id: row.id! }),
                  PriceListService.getAll({ type: "room", is_default: 1 }, {}),
                  PriceListService.getAll({ type: "discount", is_default: 1 }, {}),
                ]);

              const { roomTypes } = pricesList.results[0];
              const price = roomTypes?.find((t) => t?.id === row.id);

              let discount: Discount | undefined | null = null;

              if (priceListDiscount.results.length) {
                const ds = priceListDiscount.results[0].roomTypes?.find((t) => t?.id === row.id);

                if (ds) {
                  discount = ds.discount;
                }
              }

              resolve({
                ...row,
                amenities: amenities.filter((t) => t),
                equipments: equipments.filter((t) => t),
                prices: price?.prices,
                discount,
                images: images.results?.length ? images.results : [],
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<RoomType>) => {
    return await RoomTypeModel.findOne<RoomType>({ deleted_at: isNull(), ...conditions });
  };

  static deleteById = async (id: number) => {
    const roomConstrains = await RoomService.findOne({ room_type_id: id });

    if (roomConstrains) {
      throw new ForbiddenRequestError(
        `Bạn không được phép xóa. Loại phòng này đã bị ràng buộc bởi một phòng nào đó.`
      );
    }

    let deleted = await RoomTypeModel.update<Partial<RoomType>, RoomType>(
      { deleted_at: dateTimeSql() },
      id,
      "id"
    );

    if (!deleted) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static truncateTrash = async (id: number) => {
    const getImages = await ImagesRoomTypeService.getAll({ room_type_id: id });

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await Promise.all([
        transaction.delete<EquipmentRoomType>({
          conditions: { room_type_id: id },
          pool: connection,
          table: EquipmentRoomTypeModel.getTable,
        }),
        transaction.delete<AmenityRoomType>({
          conditions: { room_type_id: id },
          pool: connection,
          table: AmenityRoomTypeModel.getTable,
        }),
        transaction.delete<ImagesRoomType>({
          conditions: { room_type_id: id },
          pool: connection,
          table: ImagesRoomTypeModel.getTable,
        }),
        transaction.delete<RoomPrice>({
          conditions: { room_type_id: id },
          pool: connection,
          table: RoomPriceModel.getTable,
        }),
      ]);

      const deleted = await transaction.delete<RoomType>({
        conditions: { id: id },
        pool: connection,
        table: RoomTypeModel.getTable,
      });

      if (!deleted) {
        throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
      }
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    await Promise.all(
      getImages.results.map(
        ({ src }) =>
          new Promise(async (resolve, reject) => {
            try {
              await removeImageV2(src);
              resolve(true);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return true;
  };

  static restore = async (id: number) => {
    let restored = await RoomTypeModel.update<Partial<RoomType>, RoomType>(
      { deleted_at: null },
      id,
      "id"
    );

    if (!restored) {
      throw new NotFoundRequestError(
        `Đã lỗi xảy ra khi khôi phục dữ liệu loại phòng. Không tìm thấy id = ${id}`
      );
    }

    return true;
  };
}

export default RoomTypeService;
