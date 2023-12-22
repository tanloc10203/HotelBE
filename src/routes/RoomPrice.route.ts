import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { RoomPriceController } from "@/controllers";
import { RoomPriceCreateSchema, RoomPriceUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(RoomPriceCreateSchema)),
		asyncHandler(RoomPriceController.create)
	)
	.get(asyncHandler(RoomPriceController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(RoomPriceUpdateSchema)),
		asyncHandler(RoomPriceController.update)
	)
	.delete(asyncHandler(RoomPriceController.delete))
	.get(asyncHandler(RoomPriceController.getById));

export default route;