import { object, string, TypeOf } from "zod";

export const RepresentativeCreateSchema = object({
	body: object({
		full_name: string({
			required_error: "full_name là trường bắt buộc",
		}),
		photo: string({
			required_error: "photo là trường bắt buộc",
		}),
	}),
});

export const RepresentativeUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		full_name: string({
			required_error: "full_name là trường bắt buộc",
		}),
		photo: string({
			required_error: "photo là trường bắt buộc",
		}),
	}),
});

export type RepresentativeInputCreate = TypeOf<typeof RepresentativeCreateSchema>["body"];

export type RepresentativeInputUpdate = TypeOf<typeof RepresentativeUpdateSchema>;
