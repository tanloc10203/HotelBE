import { Transaction } from "@/lib";
import {
  Discount,
  DiscountModel,
  PriceByHour,
  PriceByHourModel,
  PriceList,
  PriceListModel,
  RoomPrice,
  RoomPriceModel,
  RoomType,
} from "@/models";
import {
  PriceListInputCreate,
  PriceListInputCreateDiscount,
  PriceListInputUpdate,
  PriceListInputUpdateDiscount,
} from "@/schema";
import {
  ConflictRequestError,
  InternalServerRequestError,
  NotFoundRequestError,
  dateTimeSql,
  generateUUIDv2,
  isNotNull,
  rawLike,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import PriceByHourService from "./PriceByHour.service";
import RoomPriceService from "./RoomPrice.service";
import DiscountService from "./Discount.service";

type GetPriceByHour = Awaited<ReturnType<typeof PriceByHourService.getAll>>["results"];

type ResponseRoomTypes =
  | (RoomType & {
      discount?: Discount | null;
      prices?: RoomPrice & {
        price_hours: GetPriceByHour;
      };
    })
  | null;

type GetAllState = PriceList & {
  roomTypes?: ResponseRoomTypes[];
};

class PriceListService {
  // Add new price list for room
  static create = async (data: PriceListInputCreate) => {
    const { roomTypes, ...others } = data;
    const [nameExists, priceListDefault] = await Promise.all([
      PriceListService.findOne({
        name: rawLike(data.name),
        type: others.type,
      }),
      PriceListService.findOne({ type: others.type, is_default: 1 }),
    ]);

    if (nameExists) {
      throw new ConflictRequestError(`Tên bảng giá đã tồn tại`);
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const priceListId = generateUUIDv2("PLID");

    try {
      await connection.beginTransaction();

      await transaction.create<PriceList>({
        data: {
          ...others,
          id: priceListId,
          is_default: !priceListDefault ? 1 : others.is_default,
          start_time: dateTimeSql(others.start_time),
          end_time: dateTimeSql(others.end_time),
        },
        pool: connection,
        table: PriceListModel.getTable,
      });

      if (priceListDefault && others.is_default) {
        await transaction.update<Partial<PriceList>, PriceList>({
          data: { is_default: 0 },
          key: "id",
          pool: connection,
          table: PriceListModel.getTable,
          valueOfKey: priceListDefault.id!,
        });
      }

      let roomPrices: RoomPrice[] = [];
      let priceByHours: PriceByHour[] = [];

      const roomTypeLength = roomTypes.length;

      for (let index = 0; index < roomTypeLength; index++) {
        const {
          prices: { price_hours, price_offline, price_online, room_type_id },
        } = roomTypes[index];

        const priceHourLength = price_hours.length;

        const roomPriceId = generateUUIDv2("RRID");

        roomPrices.push({
          price_list_id: priceListId,
          price_offline,
          price_online,
          room_type_id,
          id: roomPriceId,
        });

        for (let j = 0; j < priceHourLength; j++) {
          const { price, room_type_id, start_hour } = price_hours[j];
          priceByHours.push({ price, room_price_id: roomPriceId, room_type_id, start_hour });
        }
      }

      const insertRoomPrices = roomPrices.map((t) => [
        t.id,
        t.price_list_id,
        t.room_type_id,
        t.price_online,
        t.price_offline,
        null, // deleted_at
      ]);

      const insertPriceByHours = priceByHours.map((t) => [
        t.room_price_id,
        t.room_type_id,
        t.start_hour,
        t.price,
        null, // deleted_at
      ]);

      await transaction.createBulk({
        pool: connection,
        data: insertRoomPrices,
        table: RoomPriceModel.getTable,
        fillables: RoomPriceModel.getFillables,
        withId: true,
      });

      await transaction.createBulk({
        pool: connection,
        data: insertPriceByHours,
        table: PriceByHourModel.getTable,
        fillables: PriceByHourModel.getFillables,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return priceListId;
  };

  static update = async (data: PriceListInputUpdate["body"], id: string) => {
    const { roomTypes, ...others } = data;
    const [nameExists, priceListDefault, { results: priceListOld }] = await Promise.all([
      PriceListService.findOne({
        name: rawLike(data.name),
        type: others.type,
      }),
      PriceListService.findOne({ type: others.type, is_default: 1 }),
      PriceListService.getAll({ id: id }, {}),
    ]);
    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Tên bảng giá đã tồn tại`);
    }
    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();
    try {
      await connection.beginTransaction();
      await transaction.update<Partial<PriceList>, PriceList>({
        data: {
          ...others,
          is_default: !priceListDefault ? 1 : priceListDefault.id === id ? 1 : others.is_default,
          start_time: dateTimeSql(others.start_time),
          end_time: dateTimeSql(others.end_time),
        },
        pool: connection,
        table: PriceListModel.getTable,
        key: "id",
        valueOfKey: id,
      });
      if (priceListDefault && priceListDefault.id !== id && others.is_default) {
        await transaction.update<Partial<PriceList>, PriceList>({
          data: { is_default: 0 },
          key: "id",
          pool: connection,
          table: PriceListModel.getTable,
          valueOfKey: priceListDefault.id!,
        });
      }
      let roomPrices: RoomPrice[] = [];
      let priceByHoursUpdate: PriceByHour[] = [];
      let priceByHoursInserts: PriceByHour[] = [];
      let priceInserts: RoomPrice[] = [];

      const priceListOldTemp = priceListOld[0]?.roomTypes?.map((t) => t?.id);
      const roomTypeLength = roomTypes.length;

      for (let index = 0; index < roomTypeLength; index++) {
        let {
          id: roomTypeID,
          prices: {
            id: roomPriceId,
            price_list_id,
            price_hours,
            price_offline,
            price_online,
            room_type_id,
          },
        } = roomTypes[index];

        if (!priceListOldTemp?.includes(roomTypeID) || !roomPriceId) {
          roomPriceId = generateUUIDv2("RRID");

          priceInserts.push({
            price_list_id: id,
            price_offline,
            price_online,
            room_type_id,
            id: roomPriceId,
          });
        } else {
          roomPrices.push({
            price_list_id: price_list_id!,
            price_offline,
            price_online,
            room_type_id,
            id: roomPriceId,
          });
        }

        const priceHourLength = price_hours.length;

        for (let j = 0; j < priceHourLength; j++) {
          const { price, room_type_id, start_hour, id, room_price_id } = price_hours[j];
          if (!id && !room_price_id) {
            priceByHoursInserts.push({
              price,
              room_price_id: roomPriceId!,
              room_type_id,
              start_hour,
            });
          } else {
            priceByHoursUpdate.push({
              price,
              room_price_id: room_price_id!,
              room_type_id,
              start_hour,
              id,
            });
          }
        }
      }
      console.log("====================================");
      console.log({ priceInserts, roomPrices });
      console.log("====================================");

      // throw new InternalServerRequestError(`Maintain system`);
      const priceByHoursOldsArray = await Promise.all(
        roomPrices.map(
          (row): Promise<GetPriceByHour> =>
            new Promise(async (resolve, reject) => {
              try {
                const { results: priceByHours } = await PriceByHourService.getAll(
                  { room_price_id: row.id },
                  { limit: 9999 }
                );
                resolve(priceByHours);
              } catch (error) {
                reject(error);
              }
            })
        )
      );

      const initial: GetPriceByHour = [];
      const priceByHoursOlds = priceByHoursOldsArray.reduce(
        (results, value) => (results = [...results, ...value]),
        initial
      );

      const priceByHoursOldLength = priceByHoursOlds.length;
      const updateTemp = priceByHoursUpdate.map((t) => t.id);

      for (let index = 0; index < priceByHoursOldLength; index++) {
        const old = priceByHoursOlds[index];
        if (!updateTemp.includes(old.id)) {
          priceByHoursUpdate.push({ ...old, deleted_at: dateTimeSql() });
        }
      }

      const priceByHoursDeletedArray = await Promise.all(
        roomPrices.map(
          (row): Promise<GetPriceByHour> =>
            new Promise(async (resolve, reject) => {
              try {
                const { results: priceByHours } = await PriceByHourService.getAll(
                  { deleted_at: isNotNull(), room_price_id: row.id },
                  { limit: 9999 }
                );
                resolve(priceByHours);
              } catch (error) {
                reject(error);
              }
            })
        )
      );

      const priceByHoursDeleted = priceByHoursDeletedArray.reduce(
        (results, value) => (results = [...results, ...value]),
        initial
      );

      const priceByHoursInsertsLength = priceByHoursInserts.length;
      const priceDeletedTemp = priceByHoursDeleted.map((t) => t.start_hour);
      for (let index = 0; index < priceByHoursInsertsLength; index++) {
        const priceInsert = priceByHoursInserts[index];
        if (priceDeletedTemp.includes(priceInsert.start_hour)) {
          const priceByHoursOld = priceByHoursDeleted.find(
            (t) => t.start_hour === priceInsert.start_hour
          );
          if (priceByHoursOld) {
            priceByHoursInserts = [
              ...priceByHoursInserts.filter((t) => t.start_hour !== priceInsert.start_hour),
            ];
            priceByHoursUpdate.push({
              ...priceByHoursOld,
              price: priceInsert.price,
              deleted_at: null,
            });
          }
        }
      }

      const insertPriceByHours = priceByHoursInserts.map((t) => [
        t.room_price_id,
        t.room_type_id,
        t.start_hour,
        t.price,
        null, // deleted_at
      ]);

      if (priceInserts.length) {
        const insertRoomPrices = priceInserts.map((t) => [
          t.id,
          t.price_list_id,
          t.room_type_id,
          t.price_online,
          t.price_offline,
          null, // deleted_at
        ]);

        await transaction.createBulk({
          pool: connection,
          data: insertRoomPrices,
          table: RoomPriceModel.getTable,
          fillables: RoomPriceModel.getFillables,
          withId: true,
        });
      }

      await Promise.all([
        ...roomPrices.map(
          (roomPrice) =>
            new Promise(async (resolve, reject) => {
              try {
                await transaction.update<Partial<RoomPrice>, RoomPrice>({
                  data: roomPrice,
                  key: "id",
                  pool: connection,
                  table: RoomPriceModel.getTable,
                  valueOfKey: roomPrice.id!,
                });
                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        ),
        ...priceByHoursUpdate.map(
          (priceByH) =>
            new Promise(async (resolve, reject) => {
              try {
                await transaction.update<Partial<PriceByHour>, PriceByHour>({
                  data: priceByH,
                  key: "id",
                  pool: connection,
                  table: PriceByHourModel.getTable,
                  valueOfKey: priceByH.id!,
                });
                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        ),
        priceByHoursInserts.length
          ? transaction.createBulk({
              pool: connection,
              data: insertPriceByHours,
              table: PriceByHourModel.getTable,
              fillables: PriceByHourModel.getFillables,
            })
          : null,
      ]);

      // console.log("====================================");
      // console.log({
      //   roomPrices,
      //   priceByHoursUpdate,
      //   insertPriceByHours,
      // });
      // console.log("====================================");
      // throw new InternalServerRequestError(`Maintain system`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }
    return id;
  };

  static createDiscount = async (data: PriceListInputCreateDiscount) => {
    const { roomTypes, ...others } = data;
    const [nameExists, priceListDefault] = await Promise.all([
      PriceListService.findOne({
        name: rawLike(data.name),
        type: others.type,
      }),
      PriceListService.findOne({ type: others.type, is_default: 1 }),
    ]);

    if (nameExists) {
      throw new ConflictRequestError(`Tên bảng giá khuyến mãi đã tồn tại`);
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const priceListId = generateUUIDv2("DLID");

    try {
      await connection.beginTransaction();

      await transaction.create<PriceList>({
        data: {
          ...others,
          id: priceListId,
          is_default: others.is_default,
          start_time: dateTimeSql(others.start_time),
          end_time: dateTimeSql(others.end_time),
        },
        pool: connection,
        table: PriceListModel.getTable,
      });

      if (priceListDefault && others.is_default) {
        await transaction.update<Partial<PriceList>, PriceList>({
          data: { is_default: 0 },
          key: "id",
          pool: connection,
          table: PriceListModel.getTable,
          valueOfKey: priceListDefault.id!,
        });
      }

      const discountInsert = roomTypes
        .filter((t) => t.discount.price !== 0)
        .map((t) => {
          const discountId = generateUUIDv2("DID");

          return [
            discountId,
            priceListId,
            t.id,
            t.discount.code_used,
            t.discount.num_discount,
            t.discount.price,
            dateTimeSql(t.discount.time_start),
            dateTimeSql(t.discount.time_end),
            t.discount.status,
            t.discount.is_public,
            null,
          ];
        });

      await transaction.createBulk({
        data: discountInsert,
        fillables: DiscountModel.getFillables,
        pool: connection,
        table: DiscountModel.getTable,
        withId: true,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return priceListId;
  };

  static updateDiscount = async (data: PriceListInputUpdateDiscount["body"], id: string) => {
    const { roomTypes, ...others } = data;
    const [nameExists, priceListDefault, discountAll, discountAllDeleted] = await Promise.all([
      PriceListService.findOne({
        name: rawLike(data.name),
        type: others.type,
      }),
      PriceListService.findOne({ type: others.type, is_default: 1 }),
      DiscountService.getAll({ price_list_id: id }, { order: "price_list_id,asc" }),
      DiscountService.getAll(
        { price_list_id: id, deleted_at: isNotNull() },
        { order: "price_list_id,asc" }
      ),
    ]);

    if (nameExists && nameExists.id !== id) {
      throw new ConflictRequestError(`Tên bảng giá khuyến mãi đã tồn tại`);
    }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      await connection.beginTransaction();

      await transaction.update<Partial<PriceList>, PriceList>({
        data: {
          ...others,
          is_default: others.is_default,
          start_time: dateTimeSql(others.start_time),
          end_time: dateTimeSql(others.end_time),
        },
        pool: connection,
        table: PriceListModel.getTable,
        key: "id",
        valueOfKey: id,
      });

      if (priceListDefault && priceListDefault.id !== id && others.is_default) {
        await transaction.update<Partial<PriceList>, PriceList>({
          data: { is_default: 0 },
          key: "id",
          pool: connection,
          table: PriceListModel.getTable,
          valueOfKey: priceListDefault.id!,
        });
      }

      let discountInserts: Discount[] = [];
      let discountUpdates: Discount[] = [];

      const roomTypeLength = roomTypes.length;

      for (let index = 0; index < roomTypeLength; index++) {
        const { discount } = roomTypes[index];

        if (discount.id && discount.price_list_id) {
          discountUpdates.push(discount);
        } else {
          const discountId = generateUUIDv2("DID");

          discountInserts.push({
            ...discount,
            id: discountId,
            time_end: dateTimeSql(discount.time_end),
            time_start: dateTimeSql(discount.time_start),
            price_list_id: id,
            deleted_at: null,
          });
        }
      }

      const discountAllDeletedOld = discountAllDeleted.results.map(
        (t) => t?.discount?.room_type_id!
      );
      const discountUpdatesTemp = discountUpdates.map((t) => t.id);
      const discountInsertsLength = discountInserts.length;
      const discountAllOldLength = discountAll.results.length;

      for (let index = 0; index < discountAllOldLength; index++) {
        const old = discountAll.results[index];

        if (!discountUpdatesTemp.includes(old?.discount?.id)) {
          discountUpdates.push({ ...old?.discount!, deleted_at: dateTimeSql() });
        }
      }

      for (let index = 0; index < discountInsertsLength; index++) {
        const discountInsert = discountInserts[index];

        if (discountAllDeletedOld.includes(discountInsert.room_type_id)) {
          const findDeleted = discountAllDeleted.results.filter(
            (t) => t?.discount?.room_type_id === discountInsert.room_type_id
          )[0];

          discountUpdates.push({ ...discountInsert, id: findDeleted?.discount?.id });

          discountInserts = [
            ...discountInserts.filter((t) => t.room_type_id !== discountInsert.room_type_id),
          ];
        }
      }

      const discountInsert = discountInserts.map((t) => {
        return [
          t.id,
          t.price_list_id,
          t.room_type_id,
          t.code_used,
          t.num_discount,
          t.price,
          dateTimeSql(t.time_start),
          dateTimeSql(t.time_end),
          t.status,
          t.is_public,
          null,
        ];
      });

      await Promise.all([
        ...discountUpdates.map(
          (d) =>
            new Promise(async (resolve, reject) => {
              try {
                await transaction.update<Partial<Discount>, Discount>({
                  data: {
                    ...d,
                    status: "using",
                    time_end: dateTimeSql(d.time_end),
                    time_start: dateTimeSql(d.time_start),
                  },
                  key: "id",
                  pool: connection,
                  table: DiscountModel.getTable,
                  valueOfKey: d.id!,
                });

                resolve(true);
              } catch (error) {
                reject(error);
              }
            })
        ),

        discountInserts.length
          ? transaction.createBulk({
              data: discountInsert,
              fillables: DiscountModel.getFillables,
              pool: connection,
              table: DiscountModel.getTable,
              withId: true,
            })
          : null,
      ]);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    return id;
  };

  static getById = async (id: number) => {
    const data = await PriceListModel.findOne<PriceList>({ id: id });

    if (!data) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    const results = await PriceListModel.findAll<PriceList>(filters, undefined, options);
    const total = await PriceListModel.count(filters);
    if (!results.length) return { results: [], total: 0 };

    const data = await Promise.all(
      results.map(
        (row): Promise<GetAllState> =>
          new Promise(async (resolve, reject) => {
            try {
              if (row.type === "room") {
                const { results: details } = await RoomPriceService.getAll(
                  { price_list_id: row.id },
                  { order: "room_type_id,asc" }
                );

                return resolve({ ...row, roomTypes: details });
              }

              if (row.type === "discount") {
                const { results: details } = await DiscountService.getAll(
                  { price_list_id: row.id },
                  { order: "room_type_id,asc" },
                  true
                );

                return resolve({ ...row, roomTypes: details });
              }

              return resolve(row);
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: data, total };
  };

  static findOne = async (conditions: ObjectType<PriceList>) => {
    return await PriceListModel.findOne<PriceList>(conditions);
  };

  static deleteById = async (id: number) => {
    if (!(await PriceListModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default PriceListService;
