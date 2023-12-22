import { Model } from "@/lib";

export interface Rate {
  id?: string;
  booking_id: string;
  room_id: number;
  customer_id: number;
  start: number;
  comment: string;

  is_hidden?: boolean | 1 | 0;

  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class RateModel extends Model {
  protected table: string = "Rates";

  protected fillables: string[] = [
    "id",
    "booking_id",
    "room_id",
    "customer_id",
    "is_hidden",
    "start",
    "comment",
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
}

export default new RateModel();
