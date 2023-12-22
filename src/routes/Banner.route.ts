import { BannerController } from "@/controllers";
import { uploadMultiple, validateFile, validateResource } from "@/middlewares";
import { BannerUpdateSchema } from "@/schema";
import { asyncHandler, upload } from "@/utils";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    [
      upload.array("images"),
      validateFile("array", "images"),
      asyncHandler(uploadMultiple("banners")),
    ],
    asyncHandler(BannerController.create)
  )
  .get(asyncHandler(BannerController.getAll));

route
  .route("/:id")
  .patch(asyncHandler(validateResource(BannerUpdateSchema)), asyncHandler(BannerController.update))
  .delete(asyncHandler(BannerController.delete))
  .get(asyncHandler(BannerController.getById));

export default route;
