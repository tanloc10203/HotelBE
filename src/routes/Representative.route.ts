import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RepresentativeController } from "@/controllers";
import { RepresentativeCreateSchema, RepresentativeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RepresentativeCreateSchema)),
		asyncHandler(RepresentativeController.create)
	)
	.get(asyncHandler(RepresentativeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RepresentativeUpdateSchema)),
		asyncHandler(RepresentativeController.update)
	)
	.delete(asyncHandler(RepresentativeController.delete))
	.get(asyncHandler(RepresentativeController.getById));

export default route;