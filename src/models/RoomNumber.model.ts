import { Model } from "@/lib";

export interface RoomNumber {
  id?: string;
  room_id: number;
  note?: string;
  status?: "maintenance" | "unavailable" | "available" | "cleanup";
  created_at?: string;
  deleted_at?: string | null;
  updated_at?: string;
}

class RoomNumberModel extends Model {
  protected table: string = "RoomNumbers";

  protected fillables: string[] = ["id", "room_id", "note", "status", "deleted_at"];

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

export default new RoomNumberModel();
