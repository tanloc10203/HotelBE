import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { BookingDetailController } from "@/controllers";
import { BookingDetailCreateSchema, BookingDetailUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    // asyncHandler(validateResource(BookingDetailCreateSchema)),
    asyncHandler(BookingDetailController.create)
  )
  .get(asyncHandler(BookingDetailController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(BookingDetailUpdateSchema)),
    asyncHandler(BookingDetailController.update)
  )
  .delete(asyncHandler(BookingDetailController.delete))
  .get(asyncHandler(BookingDetailController.getById));

export default route;
