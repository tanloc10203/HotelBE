import { Model } from "@/lib";

export interface Unit {
  id?: number;
  name: string;
  character?: string | null;
  desc?: string | null;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class UnitModel extends Model {
  protected table: string = "Units";

  protected fillables: string[] = ["id", "name", "character", "desc", "deleted_at"];

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

export default new UnitModel();
