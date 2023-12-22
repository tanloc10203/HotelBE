import { Model } from "@/lib";
import { PriceByHour } from "./PriceByHour.model";

export interface RoomPrice {
  id?: string;
  price_list_id: string;
  room_type_id: number;
  price_online: number;
  price_offline: number;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;

  price_hours?: PriceByHour[];
}

class RoomPriceModel extends Model {
  protected table: string = "RoomPrices";

  protected fillables: string[] = [
    "id",
    "price_list_id",
    "room_type_id",
    "price_online",
    "price_offline",
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

export default new RoomPriceModel();
