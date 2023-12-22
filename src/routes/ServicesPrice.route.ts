import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ServicesPriceController } from "@/controllers";
import { ServicesPriceCreateSchema, ServicesPriceUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ServicesPriceCreateSchema)),
		asyncHandler(ServicesPriceController.create)
	)
	.get(asyncHandler(ServicesPriceController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ServicesPriceUpdateSchema)),
		asyncHandler(ServicesPriceController.update)
	)
	.delete(asyncHandler(ServicesPriceController.delete))
	.get(asyncHandler(ServicesPriceController.getById));

export default route;