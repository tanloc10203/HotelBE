import { object, string, TypeOf } from "zod";

export const RoomsDiscountCreateSchema = object({
	body: object({
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
		discount_id: string({
			required_error: "discount_id là trường bắt buộc",
		}),
	}),
});

export const RoomsDiscountUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
		discount_id: string({
			required_error: "discount_id là trường bắt buộc",
		}),
	}),
});

export type RoomsDiscountInputCreate = TypeOf<typeof RoomsDiscountCreateSchema>["body"];

export type RoomsDiscountInputUpdate = TypeOf<typeof RoomsDiscountUpdateSchema>;
