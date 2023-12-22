import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { DurationsRoomController } from "@/controllers";
import { DurationsRoomCreateSchema, DurationsRoomUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(DurationsRoomCreateSchema)),
		asyncHandler(DurationsRoomController.create)
	)
	.get(asyncHandler(DurationsRoomController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(DurationsRoomUpdateSchema)),
		asyncHandler(DurationsRoomController.update)
	)
	.delete(asyncHandler(DurationsRoomController.delete))
	.get(asyncHandler(DurationsRoomController.getById));

export default route;