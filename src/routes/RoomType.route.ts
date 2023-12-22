import { uploadMultiple, validateFile, validateResource } from "@/middlewares";
import { asyncHandler, upload } from "@/utils";
import { RoomTypeController } from "@/controllers";
import { RoomTypeCreateSchema, RoomTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    [
      upload.array("images"),
      validateFile("array", "images"),
      asyncHandler(uploadMultiple("rooms")),
      asyncHandler(validateResource(RoomTypeCreateSchema)),
    ],
    asyncHandler(RoomTypeController.create)
  )
  .get(asyncHandler(RoomTypeController.getAll));

route.post("/Restore/:id", asyncHandler(RoomTypeController.restore));

route.post("/TruncateTrash/:id", asyncHandler(RoomTypeController.truncateTrash));

route
  .route("/:id")
  .patch(
    [
      upload.array("images"),
      asyncHandler(uploadMultiple("rooms")),
      asyncHandler(validateResource(RoomTypeUpdateSchema)),
    ],
    asyncHandler(RoomTypeController.update)
  )
  .delete(asyncHandler(RoomTypeController.delete))
  .get(asyncHandler(RoomTypeController.getById));

export default route;
