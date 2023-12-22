import { Model } from "@/lib";

export interface Attribute {
  id?: string;
  name: string;
  desc?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class AttributeModel extends Model {
  protected table: string = "Attributes";

  protected fillables: string[] = ["id", "name", "desc", "deleted_at"];

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

export default new AttributeModel();
