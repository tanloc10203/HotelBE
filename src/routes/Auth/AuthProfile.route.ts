import { AuthController } from "@/controllers";
import { authorization, uploadSingle, validateFile, validateResource } from "@/middlewares";
import { CustomerUpdateSchema } from "@/schema";
import { asyncHandler, upload } from "@/utils";
import { Router } from "express";

const route = Router();

route.get(
  "/Customer",
  asyncHandler(authorization("customer")),
  asyncHandler(AuthController.profileForCustomer)
);

route.get(
  "/Employee",
  asyncHandler(authorization("employee")),
  asyncHandler(AuthController.profileForEmployee)
);

route.get(
  "/Owner",
  asyncHandler(authorization("owner")),
  asyncHandler(AuthController.profileForOwner)
);

route.patch(
  "/Update/Customer/:id",
  [asyncHandler(authorization("customer")), asyncHandler(validateResource(CustomerUpdateSchema))],
  asyncHandler(AuthController.updateProfileCustomer)
);

route.patch(
  "/Update/Employee/:id",
  [asyncHandler(authorization("employee")), asyncHandler(validateResource(CustomerUpdateSchema))],
  asyncHandler(AuthController.updateProfileEmployee)
);

route.patch(
  "/Update/Owner/:id",
  [asyncHandler(authorization("owner")), asyncHandler(validateResource(CustomerUpdateSchema))],
  asyncHandler(AuthController.updateProfileOwner)
);

route.patch(
  "/Update/Photo/Customer/:id",
  [
    asyncHandler(authorization("customer")),
    upload.single("photo"),
    validateFile("single", "photo"),
    asyncHandler(uploadSingle("photos")),
  ],
  asyncHandler(AuthController.updatePhotoCustomer)
);

route.patch(
  "/Update/Photo/Employee/:id",
  [
    asyncHandler(authorization("employee")),
    upload.single("photo"),
    validateFile("single", "photo"),
    asyncHandler(uploadSingle("photos")),
  ],
  asyncHandler(AuthController.updatePhotoEmployee)
);

route.patch(
  "/Update/Photo/Owner/:id",
  [
    asyncHandler(authorization("owner")),
    upload.single("photo"),
    validateFile("single", "photo"),
    asyncHandler(uploadSingle("photos")),
  ],
  asyncHandler(AuthController.updatePhotoOwner)
);

export default route;
