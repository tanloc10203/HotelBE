import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { FloorController } from "@/controllers";
import { FloorCreateSchema, FloorUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(FloorCreateSchema)),
		asyncHandler(FloorController.create)
	)
	.get(asyncHandler(FloorController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(FloorUpdateSchema)),
		asyncHandler(FloorController.update)
	)
	.delete(asyncHandler(FloorController.delete))
	.get(asyncHandler(FloorController.getById));

export default route;