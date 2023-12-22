import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { InformationHotelController } from "@/controllers";
import { InformationHotelCreateSchema, InformationHotelUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(InformationHotelCreateSchema)),
    asyncHandler(InformationHotelController.create)
  )
  .get(asyncHandler(InformationHotelController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(InformationHotelUpdateSchema)),
    asyncHandler(InformationHotelController.update)
  )
  .get(asyncHandler(InformationHotelController.getById));

export default route;
