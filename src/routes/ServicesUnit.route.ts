import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ServicesUnitController } from "@/controllers";
import { ServicesUnitCreateSchema, ServicesUnitUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ServicesUnitCreateSchema)),
		asyncHandler(ServicesUnitController.create)
	)
	.get(asyncHandler(ServicesUnitController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ServicesUnitUpdateSchema)),
		asyncHandler(ServicesUnitController.update)
	)
	.delete(asyncHandler(ServicesUnitController.delete))
	.get(asyncHandler(ServicesUnitController.getById));

export default route;