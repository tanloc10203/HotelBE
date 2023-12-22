import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { OwnerController } from "@/controllers";
import { OwnerCreateSchema, OwnerUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(asyncHandler(validateResource(OwnerCreateSchema)), asyncHandler(OwnerController.create))
  .get(asyncHandler(OwnerController.getAll));

route
  .route("/:id")
  .patch(asyncHandler(validateResource(OwnerUpdateSchema)), asyncHandler(OwnerController.update))
  .delete(asyncHandler(OwnerController.delete))
  .get(asyncHandler(OwnerController.getById));

export default route;
