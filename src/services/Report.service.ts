import { Bill, Booking, BookingModel, Room, RoomModel } from "@/models";
import { MoneyRoomQuery, RateBookingQuery } from "@/schema";
import { dateFormat, dateTimeSql, getInfoData, isBetween, isNull, notIn } from "@/utils";
import { intervalToDuration } from "date-fns";
import moment from "moment";
import BillService from "./Bill.service";
import BookingDetailService from "./BookingDetail.service";
import GuestUseServiceService from "./GuestUseService.service";
import RoomService from "./Room.service";
import RoomTypeService from "./RoomType.service";
import ServiceService from "./Service.service";

type MoneyRoomState = {
  id: number;
  name: string;
  character: string;
  money: number;
};

type MoneyServiceState = {
  id: string;
  name: string;
  dates: Awaited<ReturnType<typeof ReportService.handleCalcMoneyService>>;
};

function getDates(startDate: Date, stopDate: Date) {
  const dateArray = [];
  let currentDate = moment(startDate);
  const endDate = moment(stopDate);

  while (currentDate <= endDate) {
    dateArray.push(moment(currentDate).format("YYYY-MM-DD"));
    currentDate = moment(currentDate).add(1, "days");
  }

  return dateArray;
}

class ReportService {
  static rateBooking = async ({ dateEnd, dateStart }: RateBookingQuery) => {
    const start = new Date(dateStart);
    const end = new Date(dateEnd);

    const [bookings, rooms] = await Promise.all([
      BookingModel.findAll<Partial<Booking>>({
        deleted_at: isNull(),
        created_at: isBetween(
          dateFormat(start, "YYYY-MM-DD 00:00:00"),
          dateFormat(end, "YYYY-MM-DD 23:59:59")
        ),
      }),
      RoomModel.findAll<Partial<Room>>({
        deleted_at: isNull(),
      }),
    ]);

    const duration = intervalToDuration({ start, end });
    const totalBookingRoom = bookings.reduce((total, value) => (total += value.total_room!), 0);
    const totalRoom =
      rooms.reduce((total, value) => (total += value.room_quantity!), 0) * (duration.days || 1);

    const rate = (totalBookingRoom * 100) / totalRoom;

    return { totalBookingRoom, totalRoom, rate: rate, day: duration.days };
  };

  /**
   * @description Quantity booking by date (online, offline, canceled, in_progress)
   * @param param0
   * @returns
   */
  static quantityBooking = async ({ dateEnd, dateStart }: RateBookingQuery) => {
    const start = dateTimeSql(new Date(dateStart), "YYYY-MM-DD 00:00:00");
    const end = dateTimeSql(new Date(dateEnd), "YYYY-MM-DD 23:59:59");

    const online = await BookingModel.count<Partial<Booking>>({
      is_booked_online: 1,
      // @ts-ignore
      deleted_at: isNull(),
      //@ts-ignore
      created_at: isBetween(start, end),
    });

    const offline = await BookingModel.count<Partial<Booking>>({
      is_booked_online: 0,
      // @ts-ignore
      deleted_at: isNull(),
      //@ts-ignore
      created_at: isBetween(start, end),
    });

    const canceled = await BookingModel.count<Partial<Booking>>({
      is_booked_online: 0,
      status: "canceled",
      // @ts-ignore
      deleted_at: isNull(),
      //@ts-ignore
      created_at: isBetween(start, end),
    });

    const inProgress = await BookingModel.count<Partial<Booking>>({
      is_booked_online: 0,
      status: "in_progress",
      // @ts-ignore
      deleted_at: isNull(),
      //@ts-ignore
      created_at: isBetween(start, end),
    });

    return { online, offline, inProgress, canceled };
  };

  static moneyRoomType = async ({ date }: MoneyRoomQuery) => {
    const startDate = date ? new Date(date) : new Date();

    const { results: roomTypes } = await RoomTypeService.getAll({}, {});

    const rooms = await Promise.all(
      roomTypes.map(
        (row): Promise<MoneyRoomState> =>
          new Promise(async (resolve, reject) => {
            try {
              const { results: rooms } = await RoomService.getAll({ room_type_id: row.id }, {});

              const response = await Promise.all(
                rooms.map(
                  (rowRoom): Promise<MoneyRoomState> =>
                    new Promise(async (resolve, reject) => {
                      try {
                        const { results } = await BookingDetailService.getAll(
                          {
                            room_id: rowRoom.id,
                            deleted_at: isNull(),
                            created_at: isBetween(
                              dateTimeSql(startDate, "YYYY-MM-DD 00:00:00"),
                              dateTimeSql(startDate, "YYYY-MM-DD 23:59:59")
                            ),
                            status: notIn("canceled"),
                          },
                          {}
                        );

                        const res = await Promise.all(
                          results.map(
                            (bdRow): Promise<Bill | null> =>
                              new Promise(async (rs, rj) => {
                                try {
                                  const bill = await BillService.findOne({
                                    booking_details_id: bdRow.id,
                                    status: "paid",
                                    deleted_at: isNull(),
                                  });

                                  rs(bill || null);
                                } catch (error) {
                                  rj(error);
                                }
                              })
                          )
                        );

                        const money = res.reduce((total, value) => {
                          let price = value?.total_price || 0;

                          if (value?.discount) {
                            price =
                              value.discount > 100
                                ? price - value.discount
                                : price - price * value.discount;
                          }

                          return (total += price);
                        }, 0);

                        const data = getInfoData(rowRoom, ["id", "roomType"]);

                        const { id, roomType } = data;
                        const { name, character } = roomType!;

                        resolve({
                          id: id!,
                          name,
                          character,
                          money,
                        });
                      } catch (error) {
                        reject(error);
                      }
                    })
                )
              );

              resolve({
                id: row.id!,
                name: row.name,
                character: row.character,
                money: response.reduce((total, v) => (total += v.money), 0),
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    const totalMoney = rooms.reduce((t, v) => (t += v.money), 0);

    return { totalMoney, date: dateFormat(startDate, "DD/MM/YYYY"), details: rooms };
  };

  static moneyService = async ({ dateEnd, dateStart }: RateBookingQuery) => {
    const startDate = new Date(dateStart);
    const endDate = new Date(dateEnd);

    const dateRange = getDates(startDate, endDate);

    const [{ results: product }, { results: service }] = await Promise.all([
      ServiceService.getAll({ is_product: 1 }, {}),
      await ServiceService.getAll({ is_product: 0 }, {}),
    ]);

    const resultsProducts = await Promise.all(
      product.map(
        (row): Promise<MoneyServiceState> =>
          new Promise(async (resolve, reject) => {
            try {
              const dates = await ReportService.handleCalcMoneyService(dateRange, row.id!);
              resolve({ id: row.id!, name: row.name, dates });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    const resultsService = await Promise.all(
      service.map(
        (row): Promise<MoneyServiceState> =>
          new Promise(async (resolve, reject) => {
            try {
              const dates = await ReportService.handleCalcMoneyService(dateRange, row.id!);
              resolve({ id: row.id!, name: row.name, dates });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { resultsProducts, resultsService };
  };

  static handleCalcMoneyService = async (dateRange: string[], serviceId: string) => {
    const dates = await Promise.all(
      dateRange.map(
        (t): Promise<{ date: string; subTotal: number }> =>
          new Promise(async (rs, rj) => {
            try {
              const startDate = new Date(t);
              const endDate = new Date(t);

              const { results: guestUseService } = await GuestUseServiceService.getAll(
                {
                  service_id: serviceId,
                  created_at: isBetween(
                    dateTimeSql(startDate, "YYYY-MM-DD 00:00:00"),
                    dateTimeSql(endDate, "YYYY-MM-DD 23:59:59")
                  ),
                },
                {}
              );

              const subTotal = guestUseService.reduce((total, value) => {
                return (total += value.sub_total);
              }, 0);

              rs({ date: t, subTotal });
            } catch (error) {
              rj(error);
            }
          })
      )
    );

    return dates;
  };
}

export default ReportService;
