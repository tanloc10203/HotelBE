import { object, string, TypeOf } from "zod";

export const VoucherCreateSchema = object({
	body: object({
		num_voucher: string({
			required_error: "num_voucher là trường bắt buộc",
		}),
		time_start: string({
			required_error: "time_start là trường bắt buộc",
		}),
		time_end: string({
			required_error: "time_end là trường bắt buộc",
		}),
		type: string({
			required_error: "type là trường bắt buộc",
		}),
	}),
});

export const VoucherUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		num_voucher: string({
			required_error: "num_voucher là trường bắt buộc",
		}),
		time_start: string({
			required_error: "time_start là trường bắt buộc",
		}),
		time_end: string({
			required_error: "time_end là trường bắt buộc",
		}),
		type: string({
			required_error: "type là trường bắt buộc",
		}),
	}),
});

export type VoucherInputCreate = TypeOf<typeof VoucherCreateSchema>["body"];

export type VoucherInputUpdate = TypeOf<typeof VoucherUpdateSchema>;
