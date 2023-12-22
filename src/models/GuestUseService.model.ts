import { Model } from "@/lib";

export interface GuestUseService {
  id?: string;
  service_id: string;
  service_unit_id: string;
  booking_details_id: string;
  guest_id?: string | null;
  quantity_ordered: number;
  price: number;
  discount?: number;
  note?: string | null;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class GuestUseServiceModel extends Model {
  protected table: string = "GuestUseServices";

  protected fillables: string[] = [
    "id",
    "service_id",
    "service_unit_id",
    "booking_details_id",
    "guest_id",
    "quantity_ordered",
    "price",
    "discount",
    "note",
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

export default new GuestUseServiceModel();
