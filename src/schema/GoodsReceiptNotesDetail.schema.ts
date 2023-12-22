import { object, string, TypeOf } from "zod";

export const GoodsReceiptNotesDetailCreateSchema = object({
	body: object({
		goods_receipt_note_id: string({
			required_error: "goods_receipt_note_id là trường bắt buộc",
		}),
		product_id: string({
			required_error: "product_id là trường bắt buộc",
		}),
		quantity_ordered: string({
			required_error: "quantity_ordered là trường bắt buộc",
		}),
		sub_total: string({
			required_error: "sub_total là trường bắt buộc",
		}),
		price: string({
			required_error: "price là trường bắt buộc",
		}),
	}),
});

export const GoodsReceiptNotesDetailUpdateSchema = object({
	params: object({
		id: string({
			required_error: "Id là tham số bắt buộc",
		}),
	}),
	body: object({
		goods_receipt_note_id: string({
			required_error: "goods_receipt_note_id là trường bắt buộc",
		}),
		product_id: string({
			required_error: "product_id là trường bắt buộc",
		}),
		quantity_ordered: string({
			required_error: "quantity_ordered là trường bắt buộc",
		}),
		sub_total: string({
			required_error: "sub_total là trường bắt buộc",
		}),
		price: string({
			required_error: "price là trường bắt buộc",
		}),
	}),
});

export type GoodsReceiptNotesDetailInputCreate = TypeOf<typeof GoodsReceiptNotesDetailCreateSchema>["body"];

export type GoodsReceiptNotesDetailInputUpdate = TypeOf<typeof GoodsReceiptNotesDetailUpdateSchema>;
