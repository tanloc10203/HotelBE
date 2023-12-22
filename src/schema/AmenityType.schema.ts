import { object, string, TypeOf } from "zod";

export const AmenityTypeCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
	}),
});

export const AmenityTypeUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
	}),
});

export type AmenityTypeInputCreate = TypeOf<typeof AmenityTypeCreateSchema>["body"];

export type AmenityTypeInputUpdate = TypeOf<typeof AmenityTypeUpdateSchema>;
