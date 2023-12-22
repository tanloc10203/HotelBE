import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { GoodsReceiptNotesDetailController } from "@/controllers";
import { GoodsReceiptNotesDetailCreateSchema, GoodsReceiptNotesDetailUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(GoodsReceiptNotesDetailCreateSchema)),
		asyncHandler(GoodsReceiptNotesDetailController.create)
	)
	.get(asyncHandler(GoodsReceiptNotesDetailController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(GoodsReceiptNotesDetailUpdateSchema)),
		asyncHandler(GoodsReceiptNotesDetailController.update)
	)
	.delete(asyncHandler(GoodsReceiptNotesDetailController.delete))
	.get(asyncHandler(GoodsReceiptNotesDetailController.getById));

export default route;