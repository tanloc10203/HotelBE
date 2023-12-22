import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RateController } from "@/controllers";
import { RateCreateSchema, RateUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RateCreateSchema)),
		asyncHandler(RateController.create)
	)
	.get(asyncHandler(RateController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RateUpdateSchema)),
		asyncHandler(RateController.update)
	)
	.delete(asyncHandler(RateController.delete))
	.get(asyncHandler(RateController.getById));

export default route;