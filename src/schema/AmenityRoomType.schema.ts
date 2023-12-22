import { object, string, TypeOf } from "zod";

export const AmenityRoomTypeCreateSchema = object({
	body: object({
		amenity_id: string({
			required_error: "amenity_id là trường bắt buộc",
		}),
		room_type_id: string({
			required_error: "room_type_id là trường bắt buộc",
		}),
	}),
});

export const AmenityRoomTypeUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		amenity_id: string({
			required_error: "amenity_id là trường bắt buộc",
		}),
		room_type_id: string({
			required_error: "room_type_id là trường bắt buộc",
		}),
	}),
});

export type AmenityRoomTypeInputCreate = TypeOf<typeof AmenityRoomTypeCreateSchema>["body"];

export type AmenityRoomTypeInputUpdate = TypeOf<typeof AmenityRoomTypeUpdateSchema>;
