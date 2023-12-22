import { BookingController } from "@/controllers";
import { validateResource } from "@/middlewares";
import {
  BookingCreateSchema,
  BookingDeskTopSchema,
  BookingUpdateSchema,
  GetBookingByCustomerSchema,
  GetBookingDetailsSchema,
  PaymentBookingSchema,
} from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(asyncHandler(validateResource(BookingCreateSchema)), asyncHandler(BookingController.create))
  .get(asyncHandler(BookingController.getAll));

route.get(
  "/BookingByCustomer",
  asyncHandler(validateResource(GetBookingByCustomerSchema)),
  asyncHandler(BookingController.getBookingByCustomer)
);

route.post(
  "/PaymentBooking",
  asyncHandler(validateResource(PaymentBookingSchema)),
  asyncHandler(BookingController.paymentBooking)
);

route.post("/CancelBooking/:id", asyncHandler(BookingController.cancelBooking));

route.post("/PaymentFailed/:id", asyncHandler(BookingController.paymentFailed));

route.get(
  "/BookingDetails",
  asyncHandler(validateResource(GetBookingDetailsSchema)),
  asyncHandler(BookingController.getBookingDetails)
);

route.post(
  "/BookingDesktop",
  asyncHandler(validateResource(BookingDeskTopSchema)),
  asyncHandler(BookingController.bookingDesktop)
);

route.post(
  "/ReceiveRoomDesktop",
  asyncHandler(validateResource(BookingDeskTopSchema)),
  asyncHandler(BookingController.receiveRoomDesktop)
);

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(BookingUpdateSchema)),
    asyncHandler(BookingController.update)
  )
  .delete(asyncHandler(BookingController.delete))
  .get(asyncHandler(BookingController.getById));

export default route;
