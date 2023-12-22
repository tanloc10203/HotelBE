import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ServicesAttributeController } from "@/controllers";
import { ServicesAttributeCreateSchema, ServicesAttributeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ServicesAttributeCreateSchema)),
		asyncHandler(ServicesAttributeController.create)
	)
	.get(asyncHandler(ServicesAttributeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ServicesAttributeUpdateSchema)),
		asyncHandler(ServicesAttributeController.update)
	)
	.delete(asyncHandler(ServicesAttributeController.delete))
	.get(asyncHandler(ServicesAttributeController.getById));

export default route;