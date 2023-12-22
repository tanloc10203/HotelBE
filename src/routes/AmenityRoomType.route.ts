import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { AmenityRoomTypeController } from "@/controllers";
import { AmenityRoomTypeCreateSchema, AmenityRoomTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(AmenityRoomTypeCreateSchema)),
		asyncHandler(AmenityRoomTypeController.create)
	)
	.get(asyncHandler(AmenityRoomTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(AmenityRoomTypeUpdateSchema)),
		asyncHandler(AmenityRoomTypeController.update)
	)
	.delete(asyncHandler(AmenityRoomTypeController.delete))
	.get(asyncHandler(AmenityRoomTypeController.getById));

export default route;