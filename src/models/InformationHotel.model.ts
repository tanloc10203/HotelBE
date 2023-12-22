import { Model } from "@/lib";

export interface InformationHotel {
  id?: string;
  name: string;
  email: string;
  address: string;
  phone_number: string;
  description?: string;
  long?: string;
  lat?: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;
}

class InformationHotelModel extends Model {
  protected table: string = "InformationHotels";

  protected fillables: string[] = [
    "id",
    "name",
    "email",
    "address",
    "phone_number",
    "description",
    "long",
    "lat",
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

export default new InformationHotelModel();
