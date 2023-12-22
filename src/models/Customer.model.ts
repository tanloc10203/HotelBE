import { Model } from "@/lib";

export type StatusCustomer = "active" | "inactive" | "banned" | "verify" | "verified";

export interface Customer {
  id?: number;
  customer_type_id: number;
  display_name: string;
  username: string;
  password: string;
  email: string;
  email_verified_at?: string | Date;
  phone_number?: string;
  phone_verified_at?: string;
  remember_token?: string | null;
  email_verify_token?: string | null;
  phone_number_verify_token?: string | null;
  status?: StatusCustomer;
  photo?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class CustomerModel extends Model {
  protected table: string = "Customers";
  protected fillables: string[] = [
    "id",
    "customer_type_id",
    "display_name",
    "username",
    "password",
    "email",
    "email_verified_at",
    "email_verify_token",
    "phone_number",
    "status",
    "phone_verified_at",
    "remember_token",
    "phone_number_verify_token",
    "photo",
    "deleted_at",
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

export default new CustomerModel();
