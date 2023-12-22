import { object, string, TypeOf } from "zod";

export const CustomerInfoCreateSchema = object({
  body: object({
    customer_id: string({
      required_error: "customer_id là trường bắt buộc",
    }),
    first_name: string({
      required_error: "first_name là trường bắt buộc",
    }),
    last_name: string({
      required_error: "last_name là trường bắt buộc",
    }),
  }),
});

export const CustomerInfoUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    customer_id: string({
      required_error: "customer_id là trường bắt buộc",
    }),
    first_name: string({
      required_error: "first_name là trường bắt buộc",
    }),
    last_name: string({
      required_error: "last_name là trường bắt buộc",
    }),
  }),
});

export type CustomerInfoInputCreate = TypeOf<typeof CustomerInfoCreateSchema>["body"];

export type CustomerInfoInputUpdate = TypeOf<typeof CustomerInfoUpdateSchema>;
