import { Model } from "@/lib";
import { calcPriceWithTax, dateTimeSql, parserBoolean } from "@/utils";
import { intervalToDuration } from "date-fns";
import dayjs from "dayjs";
import { BookingDetail } from "./BookingDetail.model";
import { Customer } from "./Customer.model";
import { RoomNumber } from "./RoomNumber.model";
import { Voucher } from "./Voucher.model";
import DiscountModel, { Discount } from "./Discount.model";
import { PriceByHour } from "./PriceByHour.model";
import { RoomPrice } from "./RoomPrice.model";

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "pending_confirmation"
  | "canceled"
  | "checked_out"
  | "in_progress"
  | "completed";

type Payload = {
  checkIn: string;
  checkOut: string;
  roomId: number;
  status: BookingStatus;
};

export type ModeBookingType = "day" | "time";

type CalcPriceWithTaxPayload = {
  modeBooking: ModeBookingType;
  priceHour: PriceByHour[];
  priceDay: number;
  voucher?: null | Voucher;
  tax: number;
  totalDateTimeCheckInOut: number;
  discount: Discount | null;
};

export interface Booking {
  id?: string;
  customer_id: number;
  employee_id?: number;
  voucher?: string | null;
  payment: "online" | "offline" | "transfer" | "others";
  mode_booking: ModeBookingType;
  total_price: number;
  total_room: number;
  is_booked_online?: boolean | 1 | 0;
  status: BookingStatus;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

interface ResponseGetRoomNumberIsBooked extends Omit<RoomNumber, "updated_at"> {
  booking_id: string;
  booking_detail_id: string;
  status_booking: BookingStatus;
  check_in: string;
  check_out: string;
  mode_booking: ModeBookingType;
  adults: number;
  children: number;
  updated_at_bd: string;
  checked_in: string;
}

class BookingModel extends Model {
  protected table: string = "Bookings";

  protected fillables: string[] = [
    "id",
    "customer_id",
    "employee_id",
    "voucher",
    "payment",
    "mode_booking",
    "total_price",
    "is_booked_online",
    "total_room",
    "status",
    "deleted_at",
  ];

  protected timestamps: boolean = true;

  get getFillables() {
    return this.fillables;
  }

  get getTable() {
    return this.table;
  }

  get getTimestamps() {
    return this.timestamps;
  }

  public async getRoomNumberIsBooked({ checkIn, checkOut, roomId, status }: Payload) {
    const response = await this.callProd<ResponseGetRoomNumberIsBooked>(
      `sp_searching_room_number_is_booked`,
      [dateTimeSql(checkIn), dateTimeSql(checkOut), roomId, status]
    );

    return response;
  }

  public async getCustomerRoomNumberIsBooked({
    checkIn,
    checkOut,
    roomNumber,
    status,
    modeBooking,
  }: { roomNumber: string; modeBooking: ModeBookingType } & Omit<Payload, "roomId">) {
    const response = await this.callProd<
      BookingDetail &
        Pick<Booking, "mode_booking" | "customer_id" | "is_booked_online"> &
        Pick<Customer, "display_name">
    >(`sp_get_customer_booked_by_room_number`, [
      roomNumber,
      dateTimeSql(checkIn),
      dateTimeSql(checkOut),
      status,
      modeBooking,
    ]);

    return response.map((r) => ({
      ...r,
      is_booked_online: parserBoolean(r.is_booked_online as any),
    }));
  }

  public async getBookedByCustomer({
    checkIn,
    checkOut,
    customerId,
    status,
  }: { customerId: number } & Omit<Payload, "roomId">) {
    const response = await this.callProd<
      BookingDetail &
        Pick<Booking, "mode_booking" | "customer_id" | "is_booked_online"> &
        Pick<Customer, "display_name">
    >(`sp_get_booked_by_customer_id`, [
      dateTimeSql(checkIn),
      dateTimeSql(checkOut),
      status,
      customerId,
    ]);

    return response.map((r) => ({
      ...r,
      is_booked_online: parserBoolean(r.is_booked_online as any),
    }));
  }

  public calcCheckInOutDateTime = ({
    checkIn,
    checkOut,
    modeBooking,
  }: Pick<Payload, "checkIn" | "checkOut"> & {
    modeBooking: ModeBookingType;
  }) => {
    const _checkIn = dayjs(new Date(checkIn));
    const _checkOut = dayjs(new Date(checkOut));
    const modeDiff = modeBooking === "time" ? "hours" : "days";
    const { hours } = intervalToDuration({ start: _checkOut.toDate(), end: _checkIn.toDate() });
    let diff = _checkOut.diff(_checkIn, modeDiff as any);

    if (modeBooking === "time") return { text: `${diff} giờ`, diff };

    let minus = -1;
    let night = 1;

    if (hours! >= 12) {
      ++diff;
      minus = hours! - 12;
      night = diff - night;
    }

    return {
      text: `${diff} ngày`,
      diff,
    };
  };

  public calcPriceWithTax({
    modeBooking,
    priceDay,
    priceHour,
    tax,
    voucher,
    totalDateTimeCheckInOut,
    discount,
  }: CalcPriceWithTaxPayload) {
    let price = DiscountModel.calcWithDiscount(
      priceDay * totalDateTimeCheckInOut,
      discount?.price || 0
    );

    if (modeBooking === "time") {
      price = DiscountModel.calcPriceHourWithDiscount({
        priceDiscount: discount?.price || 0,
        priceHours: priceHour,
        totalPrice: 0,
        totalTime: totalDateTimeCheckInOut,
      });
    }

    if (voucher) {
      const { type, percent_voucher, price_voucher } = voucher;
      price = type === "percent" ? price - price * percent_voucher! : price - price_voucher!;
    }

    return calcPriceWithTax(price, tax);
  }

  public checkInLate = (checkInInput: string) => {
    const checkIn = dayjs(new Date(checkInInput));
    const checkedIn = dayjs(new Date());

    const diff = checkIn.diff(checkedIn, "minutes");

    const durationCheckIn = intervalToDuration({
      end: checkedIn.toDate(),
      start: checkIn.toDate(),
    });

    return { ...durationCheckIn, late: diff > 0 };
  };

  public calcPriceCheckInLate = (
    duration: Duration,
    discount: Discount | null,
    prices: RoomPrice,
    tax: number
  ) => {
    const { days, hours } = duration;

    const hourByDays = days && days > 0 ? days * 24 : 0;
    const totalHours = Number(hours || 0) + hourByDays;

    // console.log("====================================");
    // console.log(`total Hours`, { totalHours, prices });

    const price = DiscountModel.calcPriceHourWithDiscount({
      priceDiscount: discount?.price || 0,
      priceHours: prices?.price_hours || [],
      totalPrice: 0,
      totalTime: totalHours,
    });

    // console.log(`price`, price);
    // console.log("====================================");

    return price + price * tax;
  };
}

export default new BookingModel();
