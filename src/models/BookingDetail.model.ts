import { Model } from "@/lib";
import { Booking } from "./Booking.model";
import { dateTimeSql, parserBoolean } from "@/utils";

type BookingDetailsStatus =
  | "pending_payment"
  | "confirmed"
  | "pending_confirmation"
  | "canceled"
  | "checked_out"
  | "in_progress"
  | "completed";

export interface BookingDetail {
  id: string;
  booking_id: string;
  room_number_id: string;
  room_id: number;
  check_in: string;
  check_out: string;
  adults: number;
  children: number | null;

  discount_id?: string | null;

  last_room_number_transfer?: string | null;
  status: BookingDetailsStatus;
  note?: string | null;

  checked_in?: string;
  checked_out?: string;

  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class BookingDetailModel extends Model {
  protected table: string = "BookingDetails";

  protected fillables: string[] = [
    "id",
    "booking_id",
    "room_number_id",
    "room_id",
    "check_in",
    "check_out",
    "checked_in",
    "adults",
    "children",
    "note",
    "discount_id",
    "last_room_number_transfer",
    "checked_out",
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

  public getBookingDetailsByDates = async ({ start, end }: { start: string; end: string }) => {
    console.log("====================================");
    console.log({ start, end });
    console.log("====================================");

    const response = await this.callProd<
      BookingDetail & Pick<Booking, "mode_booking" | "id" | "is_booked_online">
    >(`sp_get_booking_details`, [start, end]);

    console.log("====================================");
    console.log(`response`, response);
    console.log("====================================");

    return response.map((r) => ({
      ...r,
      is_booked_online: parserBoolean(r.is_booked_online as any),
    }));
  };
}

export default new BookingDetailModel();
