import { Model } from "@/lib";

export type GoodsReceiptNoteStatus = "paid" | "unpaid" | "partially_paid";

export interface GoodsReceiptNote {
  id?: string;
  supplier_id: string;
  employee_id: number;
  quantity_ordered: number;
  total_cost: number;
  total_cost_paymented: number;
  discount?: number;
  note?: string;
  status: GoodsReceiptNoteStatus;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class GoodsReceiptNoteModel extends Model {
  protected table: string = "GoodsReceiptNotes";

  protected fillables: string[] = [
    "id",
    "supplier_id",
    "employee_id",
    "quantity_ordered",
    "total_cost",
    "total_cost_paymented",
    "discount",
    "note",
    "status",
    "deleted_at",
  ];

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

export default new GoodsReceiptNoteModel();
