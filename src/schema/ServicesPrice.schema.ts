import { object, string, TypeOf } from "zod";

export const ServicesPriceCreateSchema = object({
	body: object({
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		price_original: string({
			required_error: "price_original là trường bắt buộc",
		}),
		price_sell: string({
			required_error: "price_sell là trường bắt buộc",
		}),
	}),
});

export const ServicesPriceUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		price_original: string({
			required_error: "price_original là trường bắt buộc",
		}),
		price_sell: string({
			required_error: "price_sell là trường bắt buộc",
		}),
	}),
});

export type ServicesPriceInputCreate = TypeOf<typeof ServicesPriceCreateSchema>["body"];

export type ServicesPriceInputUpdate = TypeOf<typeof ServicesPriceUpdateSchema>;
