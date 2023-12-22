import { boolean, number, object, string, TypeOf } from "zod";

export const ServiceCreateSchema = object({
  body: object({
    service_type_id: string().nonempty(),
    name: string({}).nonempty(),
    timer: string().optional(),
    desc: string().optional(),
    note: string().optional(),
    price_original: string().optional(),
    price_sell: string().nonempty(),
    units: string().nonempty(),
  }),
});

export const ServiceUpdateSchema = object({
  params: object({
    id: string({}).nonempty(),
  }),
  body: object({
    service_type_id: string().nonempty(),
    name: string({}).nonempty(),
    timer: string().optional(),
    desc: string().optional(),
    note: string().optional(),
    price_original: string().optional(),
    price_sell: string().nonempty(),
    price_id: string().optional(),
    units: string().nonempty(),
  }),
});

export const ServiceProductAddSchema = object({
  body: object({
    name: string().nonempty(),
    desc: string().optional(),
    note: string().optional(),
    service_type_id: string().nonempty(),
    price_original: string().nonempty(),
    price_sell: string().nonempty(),
    quantity: string().nonempty(),
    min_quantity_product: string().nonempty(),
    units: string().nonempty(),
    attributes: string(),
  }),
});

export const ServiceProductUpdateSchema = object({
  params: object({
    id: string({}).nonempty(),
  }),
  body: object({
    name: string().nonempty(),
    desc: string().optional(),
    note: string().optional(),
    service_type_id: string().nonempty(),
    price_original: string().nonempty(),
    price_sell: string().nonempty(),
    quantity: string().nonempty(),
    min_quantity_product: string().nonempty(),
    price_id: string().optional(),
    units: string().nonempty(),
    attributes: string().optional(),
  }),
});

export type ServiceInputCreate = TypeOf<typeof ServiceCreateSchema>["body"];

export type ServiceInputUpdate = TypeOf<typeof ServiceUpdateSchema>;

export type ServiceProductUpdate = TypeOf<typeof ServiceProductUpdateSchema>;

export type ServiceProductAddInput = TypeOf<typeof ServiceProductAddSchema>["body"];
