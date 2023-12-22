import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { ImagesRoomTypeController } from "@/controllers";
import { ImagesRoomTypeCreateSchema, ImagesRoomTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(ImagesRoomTypeCreateSchema)),
		asyncHandler(ImagesRoomTypeController.create)
	)
	.get(asyncHandler(ImagesRoomTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(ImagesRoomTypeUpdateSchema)),
		asyncHandler(ImagesRoomTypeController.update)
	)
	.delete(asyncHandler(ImagesRoomTypeController.delete))
	.get(asyncHandler(ImagesRoomTypeController.getById));

export default route;