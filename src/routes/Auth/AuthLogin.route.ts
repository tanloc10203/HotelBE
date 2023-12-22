import { AuthController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { AuthLoginSchema } from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.post(
  "/Customer",
  asyncHandler(validateResource(AuthLoginSchema)),
  asyncHandler(AuthController.loginForCustomer)
);

route.post(
  "/Employee",
  asyncHandler(validateResource(AuthLoginSchema)),
  asyncHandler(AuthController.loginForEmployee)
);

route.post(
  "/Owner",
  asyncHandler(validateResource(AuthLoginSchema)),
  asyncHandler(AuthController.loginForOwner)
);

export default route;
