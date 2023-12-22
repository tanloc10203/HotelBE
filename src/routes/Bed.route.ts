import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { BedController } from "@/controllers";
import { BedCreateSchema, BedUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(BedCreateSchema)),
		asyncHandler(BedController.create)
	)
	.get(asyncHandler(BedController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(BedUpdateSchema)),
		asyncHandler(BedController.update)
	)
	.delete(asyncHandler(BedController.delete))
	.get(asyncHandler(BedController.getById));

export default route;