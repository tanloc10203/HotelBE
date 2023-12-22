import { object, string, TypeOf } from "zod";

export const PriceByHourCreateSchema = object({
	body: object({
		room_price_id: string({
			required_error: "room_price_id là trường bắt buộc",
		}),
		start_hour: string({
			required_error: "start_hour là trường bắt buộc",
		}),
		price_online: string({
			required_error: "price_online là trường bắt buộc",
		}),
		price_offline: string({
			required_error: "price_offline là trường bắt buộc",
		}),
	}),
});

export const PriceByHourUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		room_price_id: string({
			required_error: "room_price_id là trường bắt buộc",
		}),
		start_hour: string({
			required_error: "start_hour là trường bắt buộc",
		}),
		price_online: string({
			required_error: "price_online là trường bắt buộc",
		}),
		price_offline: string({
			required_error: "price_offline là trường bắt buộc",
		}),
	}),
});

export type PriceByHourInputCreate = TypeOf<typeof PriceByHourCreateSchema>["body"];

export type PriceByHourInputUpdate = TypeOf<typeof PriceByHourUpdateSchema>;
