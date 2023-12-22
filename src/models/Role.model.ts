import { Model } from "@/lib";
import { Permission } from "./Permission.model";

export interface Role {
  id?: number;
  name: string;
  desc: string;
  created_at?: string;
  updated_at?: string;
}

export type RolePayload = {
  permissions: Permission[];
} & Role;

class RoleModel extends Model {
  protected table: string = "Roles";
  protected fillables: string[] = ["id", "name", "desc"];
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

export default new RoleModel();
