import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { AmenityTypeController } from "@/controllers";
import { AmenityTypeCreateSchema, AmenityTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(AmenityTypeCreateSchema)),
		asyncHandler(AmenityTypeController.create)
	)
	.get(asyncHandler(AmenityTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(AmenityTypeUpdateSchema)),
		asyncHandler(AmenityTypeController.update)
	)
	.delete(asyncHandler(AmenityTypeController.delete))
	.get(asyncHandler(AmenityTypeController.getById));

export default route;