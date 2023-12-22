import { number, object, string, TypeOf, z } from "zod";

export const GuestUseServiceCreateSchema = object({
  body: object({
    service_id: string().nonempty(),
    service_unit_id: string().nonempty(),
    booking_details_id: string().nonempty(),
    quantity_ordered: number().nonnegative(),
    discount: number().optional().nullable(),
    note: string().optional().nullable(),
    guest_id: string().optional().nullable(),
  }),
});

export const GuestUseServiceUpdateSchema = object({
  params: object({
    id: string().nonempty(),
  }),
  body: object({
    service_id: string().nonempty(),
    service_unit_id: string().nonempty(),
    booking_details_id: string().nonempty(),
    quantity_ordered: string().nonempty(),
    price: number().nonnegative(),
    discount: number().optional(),
    note: string().optional(),
  }),
});

export const GuestPlusMinusSchema = object({
  params: object({
    id: string().nonempty(),
  }),
  body: object({
    options: z.enum(["plus", "minus"]),
    quantity: number().nonnegative(),
  }),
});

export type GuestUseServiceInputCreate = TypeOf<typeof GuestUseServiceCreateSchema>["body"];

export type GuestUseServiceInputUpdate = TypeOf<typeof GuestUseServiceUpdateSchema>;

export type GuestPlusMinusInput = TypeOf<typeof GuestPlusMinusSchema>;
