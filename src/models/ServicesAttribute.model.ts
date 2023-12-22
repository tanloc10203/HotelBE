import { Model } from "@/lib";

export interface ServicesAttribute {
  id?: string;
  attribute_id: string;
  service_id: string;
  quantity: number;
  value: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ServicesAttributeModel extends Model {
  protected table: string = "ServicesAttributes";

  protected fillables: string[] = [
    "id",
    "attribute_id",
    "service_id",
    "quantity",
    "value",
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

export default new ServicesAttributeModel();
