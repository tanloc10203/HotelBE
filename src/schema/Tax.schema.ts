import { number, object, string, TypeOf } from "zod";

export const TaxCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    rate: number({
      required_error: "rate là trường bắt buộc",
    }),
    description: string({
      required_error: "description là trường bắt buộc",
    }).optional(),
  }),
});

export const TaxUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    rate: number({
      required_error: "rate là trường bắt buộc",
    }),
    description: string({
      required_error: "description là trường bắt buộc",
    }).optional(),
  }),
});

export type TaxInputCreate = TypeOf<typeof TaxCreateSchema>["body"];

export type TaxInputUpdate = TypeOf<typeof TaxUpdateSchema>;
