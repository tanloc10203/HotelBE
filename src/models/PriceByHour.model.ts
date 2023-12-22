import { Model } from "@/lib";

export interface PriceByHour {
  id?: number;
  room_price_id: string;
  room_type_id: number;
  start_hour: number;
  price: number;
  created_at?: string;
  deleted_at?: string | null;
  updated_at?: string;
}

class PriceByHourModel extends Model {
  protected table: string = "PriceByHours";

  protected fillables: string[] = [
    "id",
    "room_price_id",
    "room_type_id",
    "start_hour",
    "price",
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

export default new PriceByHourModel();
