import { Model } from "@/lib";
import { dateTimeSql } from "@/utils";
import { RoomNumber } from "./RoomNumber.model";

export interface Room {
  id?: number;
  floor_id: number;
  room_type_id: number;
  status?: "maintenance" | "unavailable" | "available" | "cleanup";
  is_public: 0 | 1;
  is_smoking: 0 | 1;
  is_parking: 0 | 1;
  is_breakfast: 0 | 1;
  is_pets: 0 | 1;
  is_extra_beds: 0 | 1;
  room_quantity: number;
  area: number | null;
  adults: number;
  children: number | null;
  photo_publish: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class RoomModel extends Model {
  protected table: string = "Rooms";

  protected fillables: string[] = [
    "id",
    "floor_id",
    "room_type_id",
    "room_quantity",
    "photo_publish",
    "adults",
    "children",
    "area",
    "status",
    "is_public",
    "is_smoking",
    "is_parking",
    "is_pets",
    "is_breakfast",
    "is_extra_beds",
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

  public async getRoomNumberAvailability({
    checkIn,
    checkOut,
    roomId,
  }: {
    checkIn: string;
    checkOut: string;
    roomId: number;
  }) {
    const response = await this.callProd<RoomNumber>(`sp_searching_availability`, [
      dateTimeSql(checkIn),
      dateTimeSql(checkOut),
      roomId,
    ]);

    return response;
  }
}

export default new RoomModel();
