import { number, object, string, TypeOf } from "zod";

const ProductSchema = object({
  product_id: string().nonempty(),
  unit_service_id: string().nonempty(),
  subTotal_import: number().nonnegative(),
  quantity_import: number().nonnegative(),
  price_origin: number().nonnegative(),
  price: number().nonnegative(),
});

export const GoodsReceiptNoteCreateSchema = object({
  body: object({
    discount: number(),
    note: string(),
    supplier_id: string().nonempty(),
    employee_id: number().nonnegative(),
    quantity_ordered: number().nonnegative(),
    total_cost: number().nonnegative(),
    total_cost_paymented: number().nonnegative(),
    products: ProductSchema.array().nonempty(),
  }),
});

export const GoodsReceiptNoteUpdateSchema = object({
  params: object({
    id: string().nonempty(),
  }),
  body: object({
    supplier_id: string().nonempty(),
    employee_id: string().nonempty(),
    quantity_ordered: string().nonempty(),
    total_cost: string().nonempty(),
    total_cost_paymented: string().nonempty(),
  }),
});

export type GoodsReceiptNoteInputCreate = TypeOf<typeof GoodsReceiptNoteCreateSchema>["body"];

export type GoodsReceiptNoteInputUpdate = TypeOf<typeof GoodsReceiptNoteUpdateSchema>;
