import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RoomNumberController } from "@/controllers";
import { RoomNumberCreateSchema, RoomNumberUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RoomNumberCreateSchema)),
		asyncHandler(RoomNumberController.create)
	)
	.get(asyncHandler(RoomNumberController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RoomNumberUpdateSchema)),
		asyncHandler(RoomNumberController.update)
	)
	.delete(asyncHandler(RoomNumberController.delete))
	.get(asyncHandler(RoomNumberController.getById));

export default route;