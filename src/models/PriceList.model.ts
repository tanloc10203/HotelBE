import { Model } from "@/lib";

export type PriceListStatus = "service" | "product" | "room" | "discount";

export interface PriceList {
  id?: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  type?: PriceListStatus;
  is_default: 1 | 0 | boolean;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class PriceListModel extends Model {
  protected table: string = "PriceLists";

  protected fillables: string[] = [
    "id",
    "name",
    "description",
    "start_time",
    "end_time",
    "is_default",
    "type",
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

export default new PriceListModel();
