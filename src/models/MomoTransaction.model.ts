import { Model } from "@/lib";
import { MomoPaymentType } from "./Momo.model";

export type MomoTransactionStatus = "pending" | "successfully" | "failed" | "refund";

export interface MomoTransaction {
  id?: string;
  partner_code: string;
  request_id: string;
  order_id: string;
  trans_id?: number;
  result_code?: string;
  request_type?: string;
  message?: string;
  booking_id?: string | null;
  booking_details_id?: string | null;
  lang?: string;
  amount?: number;
  order_info?: string;

  status?: MomoTransactionStatus;
  signature?: string;
  pay_type?: MomoPaymentType | null;
  order_type?: string;
  partner_user_Id?: string;
  extra_data?: string | null;

  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class MomoTransactionModel extends Model {
  protected table: string = "MomoTransactions";

  protected fillables: string[] = [
    "id",
    "partner_code",
    "request_id",
    "order_id",
    "trans_id",
    "result_code",
    "request_type",
    "message",
    "booking_id",
    "booking_details_id",
    "extra_data",
    "lang",
    "amount",
    "signature",
    "order_info",
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

export default new MomoTransactionModel();
