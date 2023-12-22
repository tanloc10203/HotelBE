import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { CustomerInfoController } from "@/controllers";
import { CustomerInfoCreateSchema, CustomerInfoUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(CustomerInfoCreateSchema)),
    asyncHandler(CustomerInfoController.create)
  )
  .get(asyncHandler(CustomerInfoController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(CustomerInfoUpdateSchema)),
    asyncHandler(CustomerInfoController.update)
  )
  .delete(asyncHandler(CustomerInfoController.delete))
  .get(asyncHandler(CustomerInfoController.getById));

export default route;
