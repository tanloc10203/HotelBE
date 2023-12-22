import { AuthController } from "@/controllers";
import { validateResource } from "@/middlewares";
import { CustomerCreateSchema, EmployeeCreateSchema, OwnerCreateSchema } from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route.post(
  "/Customer",
  asyncHandler(validateResource(CustomerCreateSchema)),
  asyncHandler(AuthController.registerForCustomer)
);

route.post(
  "/Employee",
  asyncHandler(validateResource(EmployeeCreateSchema)),
  asyncHandler(AuthController.registerForEmployee)
);

route.post(
  "/Owner",
  asyncHandler(validateResource(OwnerCreateSchema)),
  asyncHandler(AuthController.registerForOwner)
);

export default route;
