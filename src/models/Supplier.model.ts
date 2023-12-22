import { Model } from "@/lib";

export interface Supplier {
  id?: string;
  name: string;
  phone_number: string;
  address?: string;
  email?: string;
  company_name?: string;
  code_tax?: string;
  note?: string;
  status?: "active" | "inactive";
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class SupplierModel extends Model {
  protected table: string = "Suppliers";

  protected fillables: string[] = [
    "id",
    "name",
    "phone_number",
    "address",
    "email",
    "company_name",
    "code_tax",
    "note",
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

export default new SupplierModel();
