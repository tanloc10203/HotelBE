import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { CustomerTypeController } from "@/controllers";
import { CustomerTypeCreateSchema, CustomerTypeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(CustomerTypeCreateSchema)),
    asyncHandler(CustomerTypeController.create)
  )
  .get(asyncHandler(CustomerTypeController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(CustomerTypeUpdateSchema)),
    asyncHandler(CustomerTypeController.update)
  )
  .delete(asyncHandler(CustomerTypeController.delete))
  .get(asyncHandler(CustomerTypeController.getById));

export default route;
