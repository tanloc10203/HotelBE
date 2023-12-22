import { object, string, TypeOf } from "zod";

export const ServicesUnitCreateSchema = object({
	body: object({
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		unit_id: string({
			required_error: "unit_id là trường bắt buộc",
		}),
	}),
});

export const ServicesUnitUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		service_id: string({
			required_error: "service_id là trường bắt buộc",
		}),
		unit_id: string({
			required_error: "unit_id là trường bắt buộc",
		}),
	}),
});

export type ServicesUnitInputCreate = TypeOf<typeof ServicesUnitCreateSchema>["body"];

export type ServicesUnitInputUpdate = TypeOf<typeof ServicesUnitUpdateSchema>;
