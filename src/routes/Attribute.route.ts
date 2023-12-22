import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { AttributeController } from "@/controllers";
import { AttributeCreateSchema, AttributeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(AttributeCreateSchema)),
		asyncHandler(AttributeController.create)
	)
	.get(asyncHandler(AttributeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(AttributeUpdateSchema)),
		asyncHandler(AttributeController.update)
	)
	.delete(asyncHandler(AttributeController.delete))
	.get(asyncHandler(AttributeController.getById));

export default route;