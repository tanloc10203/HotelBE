import { NotificationController } from "@/controllers";
import { validateResource } from "@/middlewares";
import {
  GetNotificationByCustomerIdSchema,
  NotificationCreateSchema,
  NotificationUpdateSchema,
} from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.get(
  "/GetByCustomer",
  asyncHandler(validateResource(GetNotificationByCustomerIdSchema)),
  asyncHandler(NotificationController.getByCustomerId)
);

route
  .route("/")
  .post(
    asyncHandler(validateResource(NotificationCreateSchema)),
    asyncHandler(NotificationController.create)
  )
  .get(asyncHandler(NotificationController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(NotificationUpdateSchema)),
    asyncHandler(NotificationController.update)
  )
  .delete(asyncHandler(NotificationController.delete))
  .get(asyncHandler(NotificationController.getById));

export default route;
