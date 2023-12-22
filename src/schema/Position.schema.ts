import { object, string, TypeOf } from "zod";

export const PositionCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
  }),
});

export const PositionUpdateSchema = object({
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

export type PositionInputCreate = TypeOf<typeof PositionCreateSchema>["body"];

export type PositionInputUpdate = TypeOf<typeof PositionUpdateSchema>;
