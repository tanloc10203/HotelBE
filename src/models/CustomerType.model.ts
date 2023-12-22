import { Model } from "@/lib";

export interface CustomerType {
  id?: number;
  name: string;
  desc: string;
  is_default: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

class CustomerTypeModel extends Model {
  protected table: string = "CustomerTypes";
  protected fillables: string[] = ["id", "name", "desc", "is_default"];
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

export default new CustomerTypeModel();
