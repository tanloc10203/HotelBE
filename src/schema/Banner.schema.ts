import { object, string, TypeOf } from "zod";

export const BannerCreateSchema = object({
	body: object({
		url: string({
			required_error: "url là trường bắt buộc",
		}),
	}),
});

export const BannerUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		url: string({
			required_error: "url là trường bắt buộc",
		}),
	}),
});

export type BannerInputCreate = TypeOf<typeof BannerCreateSchema>["body"];

export type BannerInputUpdate = TypeOf<typeof BannerUpdateSchema>;
