import { AuthController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { AuthVerifyAccountSchema } from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.post(
  "/Account/Customer/:id",
  asyncHandler(validateResource(AuthVerifyAccountSchema)),
  asyncHandler(AuthController.verifyAccountForCustomer)
);

route.post(
  "/Account/Employee/:id",
  asyncHandler(validateResource(AuthVerifyAccountSchema)),
  asyncHandler(AuthController.verifyAccountForEmployee)
);

route.post(
  "/Account/Owner/:id",
  asyncHandler(validateResource(AuthVerifyAccountSchema)),
  asyncHandler(AuthController.verifyAccountForOwner)
);

export default route;
