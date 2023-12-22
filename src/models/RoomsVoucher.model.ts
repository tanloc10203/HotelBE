import { Model } from "@/lib";

export interface RoomsVoucher {
  room_id: number;
  voucher_id: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class RoomsVoucherModel extends Model {
	protected table: string = "RoomsVouchers";

	protected fillables: string[] = ["room_id","voucher_id","deleted_at"];

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

export default new RoomsVoucherModel();
