import { Model } from "@/lib";

export interface EquipmentRoomType {
  equipment_id: number;
  room_type_id: number;
  created_at?: string;
  updated_at?: string;
}

class EquipmentRoomTypeModel extends Model {
	protected table: string = "EquipmentRoomTypes";

	protected fillables: string[] = ["equipment_id","room_type_id"];

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

export default new EquipmentRoomTypeModel();
