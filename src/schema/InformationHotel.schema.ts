import { object, string, TypeOf } from "zod";

export const InformationHotelCreateSchema = object({
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		email: string({
			required_error: "email là trường bắt buộc",
		}),
		address: string({
			required_error: "address là trường bắt buộc",
		}),
		phone_number: string({
			required_error: "phone_number là trường bắt buộc",
		}),
	}),
});

export const InformationHotelUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		name: string({
			required_error: "name là trường bắt buộc",
		}),
		email: string({
			required_error: "email là trường bắt buộc",
		}),
		address: string({
			required_error: "address là trường bắt buộc",
		}),
		phone_number: string({
			required_error: "phone_number là trường bắt buộc",
		}),
	}),
});

export type InformationHotelInputCreate = TypeOf<typeof InformationHotelCreateSchema>["body"];

export type InformationHotelInputUpdate = TypeOf<typeof InformationHotelUpdateSchema>;
