import { object, string, TypeOf } from "zod";

export const ImagesRoomTypeCreateSchema = object({
	body: object({
		room_type_id: string({
			required_error: "room_type_id là trường bắt buộc",
		}),
		src: string({
			required_error: "src là trường bắt buộc",
		}),
	}),
});

export const ImagesRoomTypeUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		room_type_id: string({
			required_error: "room_type_id là trường bắt buộc",
		}),
		src: string({
			required_error: "src là trường bắt buộc",
		}),
	}),
});

export type ImagesRoomTypeInputCreate = TypeOf<typeof ImagesRoomTypeCreateSchema>["body"];

export type ImagesRoomTypeInputUpdate = TypeOf<typeof ImagesRoomTypeUpdateSchema>;
