import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { SupplierController } from "@/controllers";
import { SupplierCreateSchema, SupplierUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(SupplierCreateSchema)),
		asyncHandler(SupplierController.create)
	)
	.get(asyncHandler(SupplierController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(SupplierUpdateSchema)),
		asyncHandler(SupplierController.update)
	)
	.delete(asyncHandler(SupplierController.delete))
	.get(asyncHandler(SupplierController.getById));

export default route;