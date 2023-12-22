import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { GuestUseServiceController } from "@/controllers";
import {
  GuestPlusMinusSchema,
  GuestUseServiceCreateSchema,
  GuestUseServiceUpdateSchema,
} from "@/schema";
import { Router } from "express";

const route = Router();

route.patch(
  "/PlusMinus/:id",
  asyncHandler(validateResource(GuestPlusMinusSchema)),
  asyncHandler(GuestUseServiceController.plusMinus)
);

route
  .route("/")
  .post(
    asyncHandler(validateResource(GuestUseServiceCreateSchema)),
    asyncHandler(GuestUseServiceController.create)
  )
  .get(asyncHandler(GuestUseServiceController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(GuestUseServiceUpdateSchema)),
    asyncHandler(GuestUseServiceController.update)
  )
  .delete(asyncHandler(GuestUseServiceController.delete))
  .get(asyncHandler(GuestUseServiceController.getById));

export default route;
