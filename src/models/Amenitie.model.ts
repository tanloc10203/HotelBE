import { Model } from "@/lib";

export interface Amenitie {
  id?: number;
  type_id: number;
  name: string;
  desc?: string;
  created_at?: string;
  deleted_at?: string | null;
  updated_at?: string;
}

class AmenitieModel extends Model {
  protected table: string = "Amenities";

  protected fillables: string[] = ["id", "type_id", "name", "desc", "deleted_at"];

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

export default new AmenitieModel();
