import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PriceByHourController } from "@/controllers";
import { PriceByHourCreateSchema, PriceByHourUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(PriceByHourCreateSchema)),
		asyncHandler(PriceByHourController.create)
	)
	.get(asyncHandler(PriceByHourController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(PriceByHourUpdateSchema)),
		asyncHandler(PriceByHourController.update)
	)
	.delete(asyncHandler(PriceByHourController.delete))
	.get(asyncHandler(PriceByHourController.getById));

export default route;