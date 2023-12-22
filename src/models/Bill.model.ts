import { Model } from "@/lib";

export interface Bill {
  id?: string;

  employee_id?: number;
  booking_details_id: string;

  payment?: "online" | "offline" | "transfer" | "others";
  status: "paid" | "unpaid" | "partially_paid" | "others";

  total_price: number;
  deposit?: number;
  change?: number;
  price_received?: number;

  note?: string;
  discount?: number;

  cost_room?: number;
  cost_service?: number;
  cost_room_paid?: number;
  cost_over_checkout?: number;
  cost_last_checkin?: number;
  change_room_bill?: number;
  cost_late_checkout?: number;

  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class BillModel extends Model {
  protected table: string = "Bills";

  protected fillables: string[] = [
    "id",
    "employee_id",
    "booking_details_id",
    "total_price",
    "payment",
    "deposit",
    "change",
    "price_received",
    "cost_room",
    "cost_service",
    "cost_room_paid",
    "cost_over_checkout",
    "cost_last_checkin",
    "cost_late_checkout",
    "change_room_bill",
    "note",
    "status",
    "deleted_at",
  ];

  protected timestamps: boolean = false;

  get getFillables() {
    return this.fillables;
  }

  get getTable() {
    return this.table;
  }

  get getTimestamps() {
    return this.timestamps;
  }
}

export default new BillModel();
