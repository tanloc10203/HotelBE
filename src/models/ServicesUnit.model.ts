import { Model } from "@/lib";

export interface ServicesUnit {
  id?: string;
  service_id: string;
  unit_id: number;
  quantity?: number | null;
  is_sell?: boolean | null | 1 | 0;
  price?: number | null;
  is_default?: boolean | 1 | 0;
  quantity_in_stock?: number;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ServicesUnitModel extends Model {
  protected table: string = "ServicesUnits";

  protected fillables: string[] = [
    "id",
    "service_id",
    "unit_id",
    "quantity",
    "quantity_in_stock",
    "is_sell",
    "price",
    "is_default",
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

export default new ServicesUnitModel();
