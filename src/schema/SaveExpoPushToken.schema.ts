import { number, object, string, TypeOf, z } from "zod";

export const SaveExpoPushTokenCreateSchema = object({
  body: object({
    expo_push_token: string().nonempty(),
    user_id: number().nonnegative(),
    actor_type: z.enum(["employee", "owner", "customer"]),
  }),
});

export const SaveExpoPushTokenUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    expo_push_token: string().nonempty(),
    user_id: number().nonnegative(),
    actor_type: z.enum(["employee", "owner", "customer"]),
  }),
});

export type SaveExpoPushTokenInputCreate = TypeOf<typeof SaveExpoPushTokenCreateSchema>["body"];

export type SaveExpoPushTokenInputUpdate = TypeOf<typeof SaveExpoPushTokenUpdateSchema>;
