import { object, string, TypeOf } from "zod";

export const BedCreateSchema = object({
	body: object({
		bed_id: string({
			required_error: "bed_id là trường bắt buộc",
		}),
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
	}),
});

export const BedUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		bed_id: string({
			required_error: "bed_id là trường bắt buộc",
		}),
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
	}),
});

export type BedInputCreate = TypeOf<typeof BedCreateSchema>["body"];

export type BedInputUpdate = TypeOf<typeof BedUpdateSchema>;
