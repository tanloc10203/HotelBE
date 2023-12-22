import { object, string, TypeOf } from "zod";

export const CustomerTypeCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
  }),
});

export const CustomerTypeUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
  }),
});

export type CustomerTypeInputCreate = TypeOf<typeof CustomerTypeCreateSchema>["body"];

export type CustomerTypeInputUpdate = TypeOf<typeof CustomerTypeUpdateSchema>;
