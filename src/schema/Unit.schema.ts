import { object, string, TypeOf } from "zod";

export const UnitCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    character: string({
      required_error: "character là trường bắt buộc",
    }).optional(),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }).optional(),
  }),
});

export const UnitUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    character: string({
      required_error: "character là trường bắt buộc",
    }).optional(),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }).optional(),
  }),
});

export type UnitInputCreate = TypeOf<typeof UnitCreateSchema>["body"];

export type UnitInputUpdate = TypeOf<typeof UnitUpdateSchema>;
