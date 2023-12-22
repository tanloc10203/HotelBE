import { Model } from "@/lib";

export interface Bed {
  id?: number;
  bed_id: number;
  room_id: number;
  quantity: number;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class BedModel extends Model {
  protected table: string = "Beds";

  protected fillables: string[] = ["id", "bed_id", "room_id", "quantity", "deleted_at"];

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

export default new BedModel();
