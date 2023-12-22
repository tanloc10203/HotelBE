import { Model } from "@/lib";

export interface DurationsRoom {
  id?: number;
  room_id: number;
  check_in_from: string;
  check_in_to: string;
  check_out_from?: string;
  check_out_to: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class DurationsRoomModel extends Model {
  protected table: string = "DurationsRooms";

  protected fillables: string[] = [
    "id",
    "room_id",
    "check_in_from",
    "check_in_to",
    "check_out_from",
    "check_out_to",
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

export default new DurationsRoomModel();
