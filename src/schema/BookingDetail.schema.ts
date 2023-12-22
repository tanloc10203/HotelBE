import { object, string, TypeOf } from "zod";

export const BookingDetailCreateSchema = object({
	body: object({
		booking_id: string({
			required_error: "booking_id là trường bắt buộc",
		}),
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
	}),
});

export const BookingDetailUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		booking_id: string({
			required_error: "booking_id là trường bắt buộc",
		}),
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
	}),
});

export type BookingDetailInputCreate = TypeOf<typeof BookingDetailCreateSchema>["body"];

export type BookingDetailInputUpdate = TypeOf<typeof BookingDetailUpdateSchema>;
