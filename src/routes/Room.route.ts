import { RoomController } from "@/controllers";
import {
  authPermissions,
  authorization,
  uploadSingle,
  validateFile,
  validateResource,
} from "@/middlewares";
import {
  ChangeRoomSchema,
  CheckInSchema,
  CheckoutSchema,
  DiscountRoomCreateSchema,
  GetChangeRoomsSchema,
  GetFrontDeskSchema,
  GetInfoInProgressSchema,
  GuestStayInformationCreateSchema,
  RoomCreateSchema,
  RoomUpdateSchema,
  SearchingRoomAvailableSchema,
} from "@/schema";
import { asyncHandler, upload } from "@/utils";
import { Router } from "express";

const route = Router();

route.get(
  "/FrontDesk",
  [
    asyncHandler(authorization("employee", true)),
    asyncHandler(authPermissions("room.view", true)),
    asyncHandler(validateResource(GetFrontDeskSchema)),
  ],
  asyncHandler(RoomController.getForFrontDesk)
);

route.get(
  "/FrontDeskTimeline",
  [
    asyncHandler(authorization("employee", true)),
    asyncHandler(authPermissions("room.view", true)),
    asyncHandler(validateResource(GetFrontDeskSchema)),
  ],
  asyncHandler(RoomController.getForFrontDeskTimeline)
);

route.get(
  "/GetChangeRooms",
  asyncHandler(validateResource(GetChangeRoomsSchema)),
  asyncHandler(RoomController.getChangeRooms)
);

route.post(
  "/ChangeRoom",
  asyncHandler(validateResource(ChangeRoomSchema)),
  asyncHandler(RoomController.changeRoom)
);

route.get(
  "/InfoDetails/:bookingDetailsId",
  asyncHandler(validateResource(GetInfoInProgressSchema)),
  asyncHandler(RoomController.getInfoInProgress)
);

route.get(
  "/InformationDetailsRoom/:bookingDetailId",
  asyncHandler(RoomController.getInformationRoomByBookingDetailsId)
);

route.post(
  "/CheckOut/:bookingDetailId",
  asyncHandler(validateResource(CheckoutSchema)),
  asyncHandler(RoomController.checkout)
);

route.post("/Cleanup/:bookingDetailId", asyncHandler(RoomController.cleanupRoom));

route
  .route("/")
  .post(
    [
      upload.single("photo_publish"),
      validateFile("single", "photo_publish"),
      asyncHandler(uploadSingle("rooms")),
      asyncHandler(validateResource(RoomCreateSchema)),
    ],
    asyncHandler(RoomController.create)
  )
  .get(asyncHandler(RoomController.getAll));

route.get("/listPrices/:id", asyncHandler(RoomController.getListPrices));

route.post(
  "/AddGuest",
  asyncHandler(validateResource(GuestStayInformationCreateSchema)),
  asyncHandler(RoomController.addGuestStayInformation)
);

route.post(
  "/CheckInRooms",
  asyncHandler(validateResource(CheckInSchema)),
  asyncHandler(RoomController.checkInRooms)
);

route.post(
  "/addDiscount",
  asyncHandler(validateResource(DiscountRoomCreateSchema)),
  asyncHandler(RoomController.addDiscount)
);

route.post(
  "/searchingAvailable",
  asyncHandler(validateResource(SearchingRoomAvailableSchema)),
  asyncHandler(RoomController.searchingAvailable)
);

route.post(
  "/searchingAvailableDesktop",
  asyncHandler(validateResource(SearchingRoomAvailableSchema)),
  asyncHandler(RoomController.searchingAvailableDesktop)
);

route.get("/getCustomerByRoomNumber", asyncHandler(RoomController.getCustomerByRoomNumber));

route
  .route("/:id")
  .patch(
    [
      upload.single("photo_publish"),
      asyncHandler(uploadSingle("rooms")),
      asyncHandler(validateResource(RoomUpdateSchema)),
    ],
    asyncHandler(RoomController.update)
  )
  // .delete(asyncHandler(RoomController.delete))
  .get(asyncHandler(RoomController.getById));

export default route;
