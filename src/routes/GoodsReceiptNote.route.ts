import { validateResource } from "@/middlewares";
import { asyncHandler } from "@/utils";
import { GoodsReceiptNoteController } from "@/controllers";
import { GoodsReceiptNoteCreateSchema, GoodsReceiptNoteUpdateSchema } from "@/schema";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(GoodsReceiptNoteCreateSchema)),
    asyncHandler(GoodsReceiptNoteController.create)
  )
  .get(asyncHandler(GoodsReceiptNoteController.getAll));

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(GoodsReceiptNoteUpdateSchema)),
    asyncHandler(GoodsReceiptNoteController.update)
  )
  .delete(asyncHandler(GoodsReceiptNoteController.delete))
  .get(asyncHandler(GoodsReceiptNoteController.getById));

export default route;
