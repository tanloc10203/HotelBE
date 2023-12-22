import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RoleEmployeeController } from "@/controllers";
import { RoleEmployeeCreateSchema, RoleEmployeeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RoleEmployeeCreateSchema)),
		asyncHandler(RoleEmployeeController.create)
	)
	.get(asyncHandler(RoleEmployeeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RoleEmployeeUpdateSchema)),
		asyncHandler(RoleEmployeeController.update)
	)
	.delete(asyncHandler(RoleEmployeeController.delete))
	.get(asyncHandler(RoleEmployeeController.getById));

export default route;