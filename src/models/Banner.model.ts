import { Model } from "@/lib";

export interface Banner {
  id?: string;
  url: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class BannerModel extends Model {
  protected table: string = "Banners";

  protected fillables: string[] = ["id", "url", "deleted_at"];

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

export default new BannerModel();
