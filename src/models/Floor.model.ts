import { Model } from "@/lib";

export interface Floor {
  id?: number;
  name: string;
  desc: string;
  character: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class FloorModel extends Model {
  protected table: string = "Floors";

  protected fillables: string[] = ["id", "name", "desc", "character", "deleted_at"];

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

export default new FloorModel();
