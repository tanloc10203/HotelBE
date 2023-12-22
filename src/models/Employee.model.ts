import { Model } from "@/lib";

export interface Employee {
  id?: number;
  display_name: string;
  username: string;
  password: string;
  email?: string;
  email_verified_at?: string | Date;
  phone_number?: string;
  phone_verified_at?: string;
  remember_token?: string | null;
  email_verify_token?: string | null;
  photo?: string;
  status?: "active" | "inactive" | "banned" | "retired";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class EmployeeModel extends Model {
  protected table: string = "Employees";
  protected fillables: string[] = [
    "id",
    "display_name",
    "username",
    "password",
    "email",
    "email_verified_at",
    "phone_number",
    "phone_verified_at",
    "email_verify_token",
    "remember_token",
    "status",
    "photo",
    "status",
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

export default new EmployeeModel();
