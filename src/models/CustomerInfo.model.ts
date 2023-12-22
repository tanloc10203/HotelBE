import { Model } from "@/lib";

export interface CustomerInfo {
  id?: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  birth_date?: string | null;
  address?: string;
  desc?: string;
  gender?: "MALE" | "FEMALE" | "OTHERS";
  created_at?: string;
  updated_at?: string;
}

class CustomerInfoModel extends Model {
  protected table: string = "CustomerInfos";
  protected fillables: string[] = [
    "id",
    "customer_id",
    "first_name",
    "last_name",
    "birth_date",
    "address",
    "desc",
    "gender",
  ];
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

export default new CustomerInfoModel();
