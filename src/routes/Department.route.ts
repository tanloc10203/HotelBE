import { DepartmentController } from "@/controllers";
import { authPermissions, authorization, validateResource } from "@/middlewares";
import { DepartmentCreateSchema, DepartmentUpdateSchema } from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    [
      asyncHandler(authorization("owner")),
      asyncHandler(authPermissions("departments.add", true)),
      asyncHandler(validateResource(DepartmentCreateSchema)),
    ],
    asyncHandler(DepartmentController.create)
  )
  .get(
    [asyncHandler(authorization("owner")), asyncHandler(authPermissions("departments.view", true))],
    asyncHandler(DepartmentController.getAll)
  );

route
  .route("/:id")
  .patch(
    [
      asyncHandler(authorization("owner")),
      asyncHandler(authPermissions("departments.edit", true)),
      asyncHandler(validateResource(DepartmentUpdateSchema)),
    ],
    asyncHandler(DepartmentController.update)
  )
  .delete(
    [asyncHandler(authorization("owner")), asyncHandler(authPermissions("departments.view", true))],
    asyncHandler(DepartmentController.delete)
  )
  .get(
    [asyncHandler(authorization("owner")), asyncHandler(authPermissions("departments.view", true))],
    asyncHandler(DepartmentController.getById)
  );

export default route;
