import { object, string, TypeOf, z } from "zod";

export const SupplierCreateSchema = object({
  body: object({
    name: string({}).nonempty(),
    phone_number: string({}).nonempty(),
    address: string({}).optional(),
    email: string({}).optional(),
    company_name: string({}).optional(),
    code_tax: string({}).optional(),
    note: string({}).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

export const SupplierUpdateSchema = object({
  params: object({
    id: string({}).nonempty(),
  }),
  body: object({
    name: string({}).nonempty(),
    phone_number: string({}).nonempty(),
    address: string({}).optional(),
    email: string({}).optional(),
    company_name: string({}).optional(),
    code_tax: string({}).optional(),
    note: string({}).optional(),
    status: z.enum(["active", "inactive"]).optional(),
  }),
});

export type SupplierInputCreate = TypeOf<typeof SupplierCreateSchema>["body"];

export type SupplierInputUpdate = TypeOf<typeof SupplierUpdateSchema>;
