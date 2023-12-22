import { ReportController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { RateBookingSchema } from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.get(
  "/RateBooking",
  asyncHandler(validateResource(RateBookingSchema)),
  asyncHandler(ReportController.rateBooking)
);

route.get(
  "/QuantityBooking",
  asyncHandler(validateResource(RateBookingSchema)),
  asyncHandler(ReportController.quantityBooking)
);

route.get("/RoomTypeMoney", asyncHandler(ReportController.moneyRoomType));

route.get(
  "/ServiceMoney",
  asyncHandler(validateResource(RateBookingSchema)),
  asyncHandler(ReportController.serviceMoney)
);

export default route;
