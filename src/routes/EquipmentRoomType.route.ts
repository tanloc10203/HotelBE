import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { EquipmentRoomTypeController } from "@/controllers";
import { EquipmentRoomTypeCreateSchema, EquipmentRoomTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
	.route("/")
	.post(
		asyncHandler(validateResource(EquipmentRoomTypeCreateSchema)),
		asyncHandler(EquipmentRoomTypeController.create)
	)
	.get(asyncHandler(EquipmentRoomTypeController.getAll));

route
	.route("/:id")
	.patch(
		asyncHandler(validateResource(EquipmentRoomTypeUpdateSchema)),
		asyncHandler(EquipmentRoomTypeController.update)
	)
	.delete(asyncHandler(EquipmentRoomTypeController.delete))
	.get(asyncHandler(EquipmentRoomTypeController.getById));

export default route;