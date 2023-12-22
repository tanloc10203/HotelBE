import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { EquipmentController } from "@/controllers";
import { EquipmentCreateSchema, EquipmentUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route.get("/Groups", EquipmentController.getGroups);
route.get("/GroupFilter", EquipmentController.getByGroup);

route
  .route("/")
  .post(
    asyncHandler(validateResource(EquipmentCreateSchema)),
    asyncHandler(EquipmentController.create)
  )
  .get(asyncHandler(EquipmentController.getAll));

route.post("/Restore/:id", asyncHandler(EquipmentController.restore));

route.post("/TruncateTrash/:id", asyncHandler(EquipmentController.truncateTrash));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(EquipmentUpdateSchema)),
    asyncHandler(EquipmentController.update)
  )
  .delete(asyncHandler(EquipmentController.delete))
  .get(asyncHandler(EquipmentController.getById));

export default route;
