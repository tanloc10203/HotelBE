import { Model } from "@/lib";

export interface GuestStayInformation {
  id?: string;
  booking_details_id: string;
  room_number: string;
  full_name: string;
  gender?: "MALE" | "FEMALE" | "OTHERS";
  birthday?: string | null;
  nationality: string;
  note?: string;
  identification_type: "passport" | "cccd" | "cmnd" | "others" | "cavet_xe" | "Loai giay to";
  identification_value: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class GuestStayInformationModel extends Model {
  protected table: string = "GuestStayInformations";

  protected fillables: string[] = [
    "id",
    "booking_details_id",
    "room_number",
    "full_name",
    "gender",
    "birthday",
    "nationality",
    "note",
    "identification_type",
    "identification_value",
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

export default new GuestStayInformationModel();
