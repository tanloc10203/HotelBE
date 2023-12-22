import { object, string, TypeOf } from "zod";

export const ServiceTypeCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }).nonempty(),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }).optional(),
  }),
});

export const ServiceTypeUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }).nonempty(),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }).optional(),
  }),
});

export type ServiceTypeInputCreate = TypeOf<typeof ServiceTypeCreateSchema>["body"];

export type ServiceTypeInputUpdate = TypeOf<typeof ServiceTypeUpdateSchema>;
