import { RoleController } from "@/controllers";
import { authPermissions, authorization, validateResource } from "@/middlewares";
import { RoleCreateSchema, RoleUpdateSchema } from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(asyncHandler(validateResource(RoleCreateSchema)), asyncHandler(RoleController.create))
  .get(
    asyncHandler(authorization("employee", true)),
    asyncHandler(authPermissions("roles.view")),
    asyncHandler(RoleController.getAll)
  );

route
  .route("/:id")
  .patch(asyncHandler(validateResource(RoleUpdateSchema)), asyncHandler(RoleController.update))
  .delete(asyncHandler(RoleController.delete))
  .get(asyncHandler(RoleController.getById));

export default route;
