import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { AmenitieController } from "@/controllers";
import { AmenitieCreateSchema, AmenitieUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(AmenitieCreateSchema)),
    asyncHandler(AmenitieController.create)
  )
  .get(asyncHandler(AmenitieController.getAll));

route.post("/Restore/:id", asyncHandler(AmenitieController.restore));

route.post("/TruncateTrash/:id", asyncHandler(AmenitieController.truncateTrash));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(AmenitieUpdateSchema)),
    asyncHandler(AmenitieController.update)
  )
  .delete(asyncHandler(AmenitieController.delete))
  .get(asyncHandler(AmenitieController.getById));

export default route;
