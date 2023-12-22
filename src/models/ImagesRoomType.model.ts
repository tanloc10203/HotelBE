import { Model } from "@/lib";

export interface ImagesRoomType {
  id?: number;
  room_type_id: number;
  src: string;
  created_at?: string;
}

class ImagesRoomTypeModel extends Model {
  protected table: string = "ImagesRoomTypes";

  protected fillables: string[] = ["id", "room_type_id", "src"];

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

export default new ImagesRoomTypeModel();
