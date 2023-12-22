import { Model } from "@/lib";

export interface RoleEmployee {
  employee_id: number;
  role_id: number;
  created_at?: string;
  updated_at?: string;
}

class RoleEmployeeModel extends Model {
  protected table: string = "RoleEmployees";

  protected fillables: string[] = ["employee_id", "role_id"];

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

export default new RoleEmployeeModel();
