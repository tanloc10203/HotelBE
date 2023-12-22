import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RoomsDiscountController } from "@/controllers";
import { RoomsDiscountCreateSchema, RoomsDiscountUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RoomsDiscountCreateSchema)),
		asyncHandler(RoomsDiscountController.create)
	)
	.get(asyncHandler(RoomsDiscountController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RoomsDiscountUpdateSchema)),
		asyncHandler(RoomsDiscountController.update)
	)
	.delete(asyncHandler(RoomsDiscountController.delete))
	.get(asyncHandler(RoomsDiscountController.getById));

export default route;