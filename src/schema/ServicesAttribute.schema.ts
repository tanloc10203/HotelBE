import { object, string, TypeOf } from "zod";

export const ServicesAttributeCreateSchema = object({
	body: object({
		attribute_id: string({
			required_error: "attribute_id là trường bắt buộc",
		}),
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		quantity: string({
			required_error: "quantity là trường bắt buộc",
		}),
	}),
});

export const ServicesAttributeUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		attribute_id: string({
			required_error: "attribute_id là trường bắt buộc",
		}),
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		quantity: string({
			required_error: "quantity là trường bắt buộc",
		}),
	}),
});

export type ServicesAttributeInputCreate = TypeOf<typeof ServicesAttributeCreateSchema>["body"];

export type ServicesAttributeInputUpdate = TypeOf<typeof ServicesAttributeUpdateSchema>;
