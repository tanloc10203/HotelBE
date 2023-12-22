import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { VoucherController } from "@/controllers";
import { VoucherCreateSchema, VoucherUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(VoucherCreateSchema)),
		asyncHandler(VoucherController.create)
	)
	.get(asyncHandler(VoucherController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(VoucherUpdateSchema)),
		asyncHandler(VoucherController.update)
	)
	.delete(asyncHandler(VoucherController.delete))
	.get(asyncHandler(VoucherController.getById));

export default route;