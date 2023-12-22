import { Model } from "@/lib";

export interface RoomType {
  id?: number;
  name: string;
  character: string;
  desc: string;
  created_at?: string;
  deleted_at?: string | null;
  updated_at?: string;
}

class RoomTypeModel extends Model {
  protected table: string = "RoomTypes";

  protected fillables: string[] = ["id", "name", "character", "desc", "deleted_at"];

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

export default new RoomTypeModel();
