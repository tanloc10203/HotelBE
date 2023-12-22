import { object, string, TypeOf } from "zod";

export const FloorCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
    character: string({
      required_error: "character là trường bắt buộc",
    }),
  }),
});

export const FloorUpdateSchema = object({
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
    character: string({
      required_error: "character là trường bắt buộc",
    }),
  }),
});

export type FloorInputCreate = TypeOf<typeof FloorCreateSchema>["body"];

export type FloorInputUpdate = TypeOf<typeof FloorUpdateSchema>;
