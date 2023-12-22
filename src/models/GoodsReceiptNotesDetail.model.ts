import { Model } from "@/lib";

export interface GoodsReceiptNotesDetail {
  id?: string;
  goods_receipt_note_id: string;
  product_id: string;
  quantity_ordered: number;
  sub_total: number;
  price: number;
  discount?: number;

  unit_product_id: string;

  note?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class GoodsReceiptNotesDetailModel extends Model {
  protected table: string = "GoodsReceiptNotesDetails";

  protected fillables: string[] = [
    "id",
    "goods_receipt_note_id",
    "product_id",
    "unit_product_id",
    "quantity_ordered",
    "sub_total",
    "price",
    "discount",
    "note",
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

export default new GoodsReceiptNotesDetailModel();
