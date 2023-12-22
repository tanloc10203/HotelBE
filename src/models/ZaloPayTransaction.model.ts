import { Model } from "@/lib";

export type ZaloPayTransactionStatus = "pending" | "successfully" | "failed" | "refund";

export interface ZaloPayTransaction {
  id?: string;
  booking_id?: string;
  booking_details_id?: string;

  app_id: number;
  app_user: string;
  app_trans_id: string;

  app_time: number;
  amount: number;

  item: string;
  description: string;
  embed_data: string;

  title?: string;
  bank_code?: string;
  mac: string;

  return_code?: number;
  sub_return_code?: number;
  return_message?: string;
  sub_return_message?: string;

  zp_trans_token?: string;
  order_token?: string;

  zp_trans_id?: number;
  refund_id?: number;

  m_refund_id?: string;

  status?: ZaloPayTransactionStatus;
  is_booking?: boolean | 1 | 0;

  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class ZaloPayTransactionModel extends Model {
  protected table: string = "ZaloPayTransactions";

  protected fillables: string[] = [
    "id",
    "booking_id",
    "booking_details_id",
    "app_id",
    "app_user",
    "app_time",
    "amount",
    "app_trans_id",
    "item",
    "description",
    "embed_data",
    "bank_code",
    "mac",
    "title",
    "return_code",
    "sub_return_code",
    "return_message",
    "sub_return_message",
    "zp_trans_token",
    "order_token",
    "m_refund_id",
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

export default new ZaloPayTransactionModel();
