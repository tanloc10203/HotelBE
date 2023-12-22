import { AuthController } from "@/controllers";
import { authorization } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.post(
  "/Customer",
  asyncHandler(authorization("customer")),
  asyncHandler(AuthController.logoutForCustomer)
);

route.post(
  "/Employee",
  asyncHandler(authorization("employee")),
  asyncHandler(AuthController.logoutForEmployee)
);

route.post(
  "/Owner",
  asyncHandler(authorization("owner")),
  asyncHandler(AuthController.logoutForOwner)
);

export default route;
