import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ZaloPayTransactionController } from "@/controllers";
import { ZaloPayTransactionCreateSchema, ZaloPayTransactionUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ZaloPayTransactionCreateSchema)),
		asyncHandler(ZaloPayTransactionController.create)
	)
	.get(asyncHandler(ZaloPayTransactionController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ZaloPayTransactionUpdateSchema)),
		asyncHandler(ZaloPayTransactionController.update)
	)
	.delete(asyncHandler(ZaloPayTransactionController.delete))
	.get(asyncHandler(ZaloPayTransactionController.getById));

export default route;