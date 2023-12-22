import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PriceListController } from "@/controllers";
import {
  PriceListCreateDiscountSchema,
  PriceListCreateSchema,
  PriceListUpdateDiscountSchema,
  PriceListUpdateSchema,
} from "@/schema";
import { Router } from "express";

const route = Router();

route.post(
  "/Discount",
  asyncHandler(validateResource(PriceListCreateDiscountSchema)),
  asyncHandler(PriceListController.createDiscount)
);

route.patch(
  "/Discount/:id",
  asyncHandler(validateResource(PriceListUpdateDiscountSchema)),
  asyncHandler(PriceListController.updateDiscount)
);

route
  .route("/")
  .post(
    asyncHandler(validateResource(PriceListCreateSchema)),
    asyncHandler(PriceListController.create)
  )
  .get(asyncHandler(PriceListController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(PriceListUpdateSchema)),
    asyncHandler(PriceListController.update)
  )
  .delete(asyncHandler(PriceListController.delete))
  .get(asyncHandler(PriceListController.getById));

export default route;
