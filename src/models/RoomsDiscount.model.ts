import { Model } from "@/lib";

export interface RoomsDiscount {
  room_id: number;
  discount_id: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class RoomsDiscountModel extends Model {
	protected table: string = "RoomsDiscounts";

	protected fillables: string[] = ["room_id","discount_id","deleted_at"];

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

export default new RoomsDiscountModel();
