import { Model } from "@/lib";

export interface AmenityRoomType {
  amenity_id: number;
  room_type_id: number;
  created_at?: string;
  updated_at?: string;
}

class AmenityRoomTypeModel extends Model {
  protected table: string = "AmenityRoomTypes";

  protected fillables: string[] = ["amenity_id", "room_type_id"];

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

export default new AmenityRoomTypeModel();
