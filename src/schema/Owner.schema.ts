import { object, string, TypeOf, z } from "zod";

export const OwnerCreateSchema = object({
  body: object({
    first_name: string({
      required_error: "first_name là trường bắt buộc",
    }),
    last_name: string({
      required_error: "last_name là trường bắt buộc",
    }),
    phone_number: string({
      required_error: "phone_number là trường bắt buộc",
    }),
    username: string({
      required_error: "username là trường bắt buộc",
    }),
    password: string({
      required_error: "password là trường bắt buộc",
    }),
    email: string({
      required_error: "email là trường bắt buộc",
    }),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]).optional(),
  }),
});

export const OwnerUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    display_name: string({
      required_error: "display_name là trường bắt buộc",
    }),
    username: string({
      required_error: "username là trường bắt buộc",
    }),
    password: string({
      required_error: "password là trường bắt buộc",
    }),
    email: string({
      required_error: "email là trường bắt buộc",
    }),
  }),
});

export type OwnerInputCreate = TypeOf<typeof OwnerCreateSchema>["body"];

export type OwnerInputUpdate = TypeOf<typeof OwnerUpdateSchema>;
