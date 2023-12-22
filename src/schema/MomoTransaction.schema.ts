import { object, string, TypeOf } from "zod";

export const MomoTransactionCreateSchema = object({
	body: object({
		partner_code: string({
			required_error: "partner_code là trường bắt buộc",
		}),
		request_id: string({
			required_error: "request_id là trường bắt buộc",
		}),
		order_id: string({
			required_error: "order_id là trường bắt buộc",
		}),
	}),
});

export const MomoTransactionUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		partner_code: string({
			required_error: "partner_code là trường bắt buộc",
		}),
		request_id: string({
			required_error: "request_id là trường bắt buộc",
		}),
		order_id: string({
			required_error: "order_id là trường bắt buộc",
		}),
	}),
});

export type MomoTransactionInputCreate = TypeOf<typeof MomoTransactionCreateSchema>["body"];

export type MomoTransactionInputUpdate = TypeOf<typeof MomoTransactionUpdateSchema>;
