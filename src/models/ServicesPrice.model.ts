import { Model } from "@/lib";

export interface ServicesPrice {
  id?: string;
  service_id: string;
  price_original: number;
  price_sell: number;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ServicesPriceModel extends Model {
  protected table: string = "ServicesPrices";

  protected fillables: string[] = [
    "id",
    "service_id",
    "price_original",
    "price_sell",
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

export default new ServicesPriceModel();
