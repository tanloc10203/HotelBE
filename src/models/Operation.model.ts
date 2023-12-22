import { Model } from "@/lib";

export interface Operation {
  employee_id: number;
  department_id: number;
  position_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

class OperationModel extends Model {
  protected table: string = "Operations";

  protected fillables: string[] = ["employee_id", "department_id", "position_id", "deleted_at"];

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

export default new OperationModel();
