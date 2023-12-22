import { Model } from "@/lib";

export interface Representative {
  id?: string;
  full_name: string;
  photo: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class RepresentativeModel extends Model {
  protected table: string = "Representatives";

  protected fillables: string[] = ["id", "full_name", "photo", "deleted_at"];

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

export default new RepresentativeModel();
