import { Model } from "@/lib";

export interface Notification {
  id?: number;
  actor_type: "employee" | "owner" | "customer";
  user_id: number;
  title: string;
  body: string;

  is_read?: 1 | 0 | boolean;

  notification_type?: string;
  entity_name: string;
  entity_id: string;
  created_at?: string;
  deleted_at?: string;
  updated_at?: string;

  is_system?: 1 | 0 | boolean;
}

export const NotificationTypes = {
  CHECK_IN_SUCCESS: "CHECK_IN_SUCCESS",
  CUSTOMER_BOOKING_SUCCESS: "CUSTOMER_BOOKING_SUCCESS",
  FRONT_DESK_BOOKING_SUCCESS: "BOOKING_SUCCESS",
  FRONT_DESK_RECEIVE_SUCCESS: "RECEIVE_SUCCESS",
  CONFIRM_SUCCESS: "CONFIRM_SUCCESS",
  DELETE_AFTER_3_HOUR: "DELETE_AFTER_3_HOUR",
};

class NotificationModel extends Model {
  protected table: string = "Notifications";

  protected fillables: string[] = [
    "id",
    "actor_type",
    "user_id",
    "title",
    "body",
    "is_read",
    "notification_type",
    "entity_name",
    "entity_id",
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

export default new NotificationModel();
