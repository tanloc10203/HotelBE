import { authPermissions, authorization, validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { EmployeeController } from "@/controllers";
import { EmployeeCreateSchema, EmployeeUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    [
      asyncHandler(authorization("owner")),
      asyncHandler(authPermissions("employees.add", true)),
      asyncHandler(validateResource(EmployeeCreateSchema)),
    ],
    asyncHandler(EmployeeController.create)
  )
  .get(
    [asyncHandler(authorization("owner")), asyncHandler(authPermissions("employees.view", true))],
    asyncHandler(EmployeeController.getAll)
  );

route.get(
  "/Permissions",
  asyncHandler(authorization("employee")),
  asyncHandler(EmployeeController.getPermissions)
);

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(EmployeeUpdateSchema)),
    asyncHandler(EmployeeController.update)
  )
  .delete(asyncHandler(EmployeeController.delete))
  .get(asyncHandler(EmployeeController.getById));

export default route;
