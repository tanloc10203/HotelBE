import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { TaxController } from "@/controllers";
import { TaxCreateSchema, TaxUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(TaxCreateSchema)),
		asyncHandler(TaxController.create)
	)
	.get(asyncHandler(TaxController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(TaxUpdateSchema)),
		asyncHandler(TaxController.update)
	)
	.delete(asyncHandler(TaxController.delete))
	.get(asyncHandler(TaxController.getById));

export default route;