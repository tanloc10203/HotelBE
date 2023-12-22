import { authPermissions, authorization, validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { PositionController } from "@/controllers";
import { PositionCreateSchema, PositionUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    [
      asyncHandler(authorization("owner")),
      asyncHandler(authPermissions("positions.add", true)),
      asyncHandler(validateResource(PositionCreateSchema)),
    ],
    asyncHandler(PositionController.create)
  )
  .get(
    [asyncHandler(authorization("owner")), asyncHandler(authPermissions("positions.view", true))],
    asyncHandler(PositionController.getAll)
  );

route
  .route("/:id")
  .patch(
    [
      asyncHandler(authorization("owner")),
      asyncHandler(authPermissions("positions.edit", true)),
      asyncHandler(validateResource(PositionUpdateSchema)),
    ],
    asyncHandler(PositionController.update)
  )
  .delete(
    [asyncHandler(authorization("owner")), asyncHandler(authPermissions("positions.delete", true))],
    asyncHandler(PositionController.delete)
  )
  .get(
    [asyncHandler(authorization("owner")), asyncHandler(authPermissions("positions.view", true))],
    asyncHandler(PositionController.getById)
  );

export default route;
