import { Model } from "@/lib";

export interface ServiceType {
  id?: string;
  name: string;
  desc?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ServiceTypeModel extends Model {
  protected table: string = "ServiceTypes";

  protected fillables: string[] = ["id", "name", "desc", "deleted_at"];

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

export default new ServiceTypeModel();
