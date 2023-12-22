import { object, string, TypeOf } from "zod";

export const ZaloPayTransactionCreateSchema = object({
	body: object({
		app_id: string({
			required_error: "app_id là trường bắt buộc",
		}),
		app_user: string({
			required_error: "app_user là trường bắt buộc",
		}),
		app_trans_id: string({
			required_error: "app_trans_id là trường bắt buộc",
		}),
		item: string({
			required_error: "item là trường bắt buộc",
		}),
		description: string({
			required_error: "description là trường bắt buộc",
		}),
		embed_data: string({
			required_error: "embed_data là trường bắt buộc",
		}),
		mac: string({
			required_error: "mac là trường bắt buộc",
		}),
	}),
});

export const ZaloPayTransactionUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		app_id: string({
			required_error: "app_id là trường bắt buộc",
		}),
		app_user: string({
			required_error: "app_user là trường bắt buộc",
		}),
		app_trans_id: string({
			required_error: "app_trans_id là trường bắt buộc",
		}),
		item: string({
			required_error: "item là trường bắt buộc",
		}),
		description: string({
			required_error: "description là trường bắt buộc",
		}),
		embed_data: string({
			required_error: "embed_data là trường bắt buộc",
		}),
		mac: string({
			required_error: "mac là trường bắt buộc",
		}),
	}),
});

export type ZaloPayTransactionInputCreate = TypeOf<typeof ZaloPayTransactionCreateSchema>["body"];

export type ZaloPayTransactionInputUpdate = TypeOf<typeof ZaloPayTransactionUpdateSchema>;
