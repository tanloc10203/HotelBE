import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RoomsVoucherController } from "@/controllers";
import { RoomsVoucherCreateSchema, RoomsVoucherUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RoomsVoucherCreateSchema)),
		asyncHandler(RoomsVoucherController.create)
	)
	.get(asyncHandler(RoomsVoucherController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RoomsVoucherUpdateSchema)),
		asyncHandler(RoomsVoucherController.update)
	)
	.delete(asyncHandler(RoomsVoucherController.delete))
	.get(asyncHandler(RoomsVoucherController.getById));

export default route;