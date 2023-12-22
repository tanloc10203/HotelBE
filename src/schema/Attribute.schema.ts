import { object, string, TypeOf } from "zod";

export const AttributeCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
	}),
});

export const AttributeUpdateSchema = object({
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

export type AttributeInputCreate = TypeOf<typeof AttributeCreateSchema>["body"];

export type AttributeInputUpdate = TypeOf<typeof AttributeUpdateSchema>;
