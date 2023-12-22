import { Model } from "@/lib";

type StatusVoucher = "used" | "expired" | "using";

export interface Voucher {
  id?: string;
  num_voucher: number;
  price_voucher?: number;
  percent_voucher?: number;
  time_start: string;
  time_end: string;
  type: "price" | "percent";
  quantity_used: number;
  status: StatusVoucher;
  is_public: 0 | 1;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class VoucherModel extends Model {
  protected table: string = "Vouchers";

  protected fillables: string[] = [
    "id",
    "num_voucher",
    "price_voucher",
    "percent_voucher",
    "time_start",
    "time_end",
    "quantity_used",
    "type",
    "status",
    "is_public",
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

export default new VoucherModel();
