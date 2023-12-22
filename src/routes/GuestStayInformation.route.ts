import { GuestStayInformationController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { GuestStayInformationCreateSchema, GuestStayInformationUpdateSchema } from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(GuestStayInformationCreateSchema)),
    asyncHandler(GuestStayInformationController.create)
  )
  .get(asyncHandler(GuestStayInformationController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(GuestStayInformationUpdateSchema)),
    asyncHandler(GuestStayInformationController.update)
  )
  .delete(asyncHandler(GuestStayInformationController.delete))
  .get(asyncHandler(GuestStayInformationController.getById));

export default route;
