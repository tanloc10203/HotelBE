import { uploadSingle, validateFile, validateResource } from "@/middlewares";
import { asyncHandler, upload } from "@/utils";
import { ServiceController } from "@/controllers";
import {
  ServiceCreateSchema,
  ServiceProductAddSchema,
  ServiceProductUpdateSchema,
  ServiceUpdateSchema,
} from "@/schema";
import { Router } from "express";

const route = Router();

route.post(
  "/AddProduct",
  [
    upload.single("photo_public"),
    asyncHandler(uploadSingle("services")),
    asyncHandler(validateResource(ServiceProductAddSchema)),
  ],
  asyncHandler(ServiceController.createProduct)
);

route.patch(
  "/UpdateProduct/:id",
  [
    upload.single("photo_public"),
    asyncHandler(uploadSingle("services")),
    asyncHandler(validateResource(ServiceProductUpdateSchema)),
  ],
  asyncHandler(ServiceController.updateProduct)
);

route
  .route("/")
  .post(
    [
      upload.single("photo_public"),
      asyncHandler(uploadSingle("services")),
      asyncHandler(validateResource(ServiceCreateSchema)),
    ],
    asyncHandler(ServiceController.create)
  )
  .get(asyncHandler(ServiceController.getAll));

route
  .route("/:id")
  .patch(
    [
      upload.single("photo_public"),
      asyncHandler(uploadSingle("services")),
      asyncHandler(validateResource(ServiceUpdateSchema)),
    ],
    asyncHandler(ServiceController.update)
  )
  .delete(asyncHandler(ServiceController.delete))
  .get(asyncHandler(ServiceController.getById));

export default route;
