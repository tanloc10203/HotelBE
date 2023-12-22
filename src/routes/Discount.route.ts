import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { DiscountController } from "@/controllers";
import { DiscountCreateSchema, DiscountUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route.get("/Room/:roomId", asyncHandler(DiscountController.getByRoomId));

route
  .route("/")
  .post(
    asyncHandler(validateResource(DiscountCreateSchema)),
    asyncHandler(DiscountController.create)
  )
  .get(asyncHandler(DiscountController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(DiscountUpdateSchema)),
    asyncHandler(DiscountController.update)
  )
  .delete(asyncHandler(DiscountController.delete))
  .get(asyncHandler(DiscountController.getById));

export default route;
