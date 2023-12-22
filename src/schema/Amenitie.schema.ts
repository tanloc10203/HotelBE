import { number, object, string, TypeOf } from "zod";

export const AmenitieCreateSchema = object({
  body: object({
    type_id: number({
      required_error: "type_id là trường bắt buộc",
    }),
    name: string({
      required_error: "name là trường bắt buộc",
    }),
  }),
});

export const AmenitieUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    type_id: number({
      required_error: "type_id là trường bắt buộc",
    }),
    name: string({
      required_error: "name là trường bắt buộc",
    }),
  }),
});

export type AmenitieInputCreate = TypeOf<typeof AmenitieCreateSchema>["body"];

export type AmenitieInputUpdate = TypeOf<typeof AmenitieUpdateSchema>;
