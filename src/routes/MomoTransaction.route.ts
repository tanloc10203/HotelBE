import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { MomoTransactionController } from "@/controllers";
import { MomoTransactionCreateSchema, MomoTransactionUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(MomoTransactionCreateSchema)),
		asyncHandler(MomoTransactionController.create)
	)
	.get(asyncHandler(MomoTransactionController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(MomoTransactionUpdateSchema)),
		asyncHandler(MomoTransactionController.update)
	)
	.delete(asyncHandler(MomoTransactionController.delete))
	.get(asyncHandler(MomoTransactionController.getById));

export default route;