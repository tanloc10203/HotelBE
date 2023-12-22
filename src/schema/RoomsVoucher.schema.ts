import { object, string, TypeOf } from "zod";

export const RoomsVoucherCreateSchema = object({
	body: object({
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
		voucher_id: string({
			required_error: "voucher_id là trường bắt buộc",
		}),
	}),
});

export const RoomsVoucherUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		room_id: string({
			required_error: "room_id là trường bắt buộc",
		}),
		voucher_id: string({
			required_error: "voucher_id là trường bắt buộc",
		}),
	}),
});

export type RoomsVoucherInputCreate = TypeOf<typeof RoomsVoucherCreateSchema>["body"];

export type RoomsVoucherInputUpdate = TypeOf<typeof RoomsVoucherUpdateSchema>;
