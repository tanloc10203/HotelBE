import { object, string, TypeOf } from "zod";

export const EquipmentRoomTypeCreateSchema = object({
	body: object({
		equipment_id: string({
			required_error: "equipment_id là trường bắt buộc",
		}),
		room_type_id: string({
			required_error: "room_type_id là trường bắt buộc",
		}),
	}),
});

export const EquipmentRoomTypeUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		equipment_id: string({
			required_error: "equipment_id là trường bắt buộc",
		}),
		room_type_id: string({
			required_error: "room_type_id là trường bắt buộc",
		}),
	}),
});

export type EquipmentRoomTypeInputCreate = TypeOf<typeof EquipmentRoomTypeCreateSchema>["body"];

export type EquipmentRoomTypeInputUpdate = TypeOf<typeof EquipmentRoomTypeUpdateSchema>;
