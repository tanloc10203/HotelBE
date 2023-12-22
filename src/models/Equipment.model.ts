import { Model } from "@/lib";

export type Group =
  | "electronics"
  | "sanitary"
  | "furniture.bed"
  | "furniture"
  | "security"
  | "others"
  | "entertainment"
  | "conference"
  | "meeting"
  | "food"
  | "beverage";

export type GroupArray = { label: string; value: Group }[];

export interface Equipment {
  id?: number;
  equipment_type_id: number;
  group?: Group;
  name: string;
  desc: string;
  created_at?: string;
  deleted_at?: string | null;
  updated_at?: string;
}

class EquipmentModel extends Model {
  protected table: string = "Equipments";

  protected fillables: string[] = [
    "id",
    "group",
    "equipment_type_id",
    "name",
    "desc",
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

  get Groups(): GroupArray {
    return [
      { label: "Giường ngủ", value: "furniture.bed" },
      { label: "Đồ nội thất", value: "furniture" },
      { label: "Đồ uống", value: "beverage" },
      { label: "Hội nghi / hội thảo", value: "conference" },
      { label: "Thiết bị điện tử", value: "electronics" },
      { label: "Thiết bị giải trí", value: "entertainment" },
      { label: "Đồ ăn", value: "food" },
      { label: "Cuộc hợp", value: "meeting" },
      { label: "Thiết bị khác", value: "others" },
      { label: "Thiết bị vệ sinh", value: "sanitary" },
      { label: "Thiết bị an ninh", value: "security" },
    ];
  }
}

export default new EquipmentModel();
