import { AuthController } from "@/controllers";
import { authorization, validateResource } from "@/middlewares";
import {
  AuthChangePasswordSchema,
  AuthForgotPasswordSchema,
  AuthResetPasswordSchema,
} from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.patch(
  "/Change/Customer",
  [
    asyncHandler(authorization("customer")),
    asyncHandler(validateResource(AuthChangePasswordSchema)),
  ],
  asyncHandler(AuthController.changePasswordForCustomer)
);

route.patch(
  "/Change/Employee",
  [
    asyncHandler(authorization("employee")),
    asyncHandler(validateResource(AuthChangePasswordSchema)),
  ],
  asyncHandler(AuthController.changePasswordForEmployee)
);

route.patch(
  "/Change/Owner",
  [asyncHandler(authorization("owner")), asyncHandler(validateResource(AuthChangePasswordSchema))],
  asyncHandler(AuthController.changePasswordForOwner)
);

route.post(
  "/Forgot/Customer",
  asyncHandler(validateResource(AuthForgotPasswordSchema)),
  asyncHandler(AuthController.forgotPasswordForCustomer)
);

route.post(
  "/Forgot/Employee",
  asyncHandler(validateResource(AuthForgotPasswordSchema)),
  asyncHandler(AuthController.forgotPasswordForEmployee)
);

route.post(
  "/Forgot/Owner",
  asyncHandler(validateResource(AuthForgotPasswordSchema)),
  asyncHandler(AuthController.forgotPasswordForOwner)
);

route.post(
  "/Reset/Customer/:id/:token",
  asyncHandler(validateResource(AuthResetPasswordSchema)),
  asyncHandler(AuthController.resetPasswordForCustomer)
);

route.post(
  "/Reset/Employee/:id/:token",
  asyncHandler(validateResource(AuthResetPasswordSchema)),
  asyncHandler(AuthController.resetPasswordForEmployee)
);

route.post(
  "/Reset/Owner/:id/:token",
  asyncHandler(validateResource(AuthResetPasswordSchema)),
  asyncHandler(AuthController.resetPasswordForOwner)
);

export default route;
