import { boolean, object, string, TypeOf } from "zod";

export const NotificationCreateSchema = object({
  body: object({
    actor_type: string({
      required_error: "actor_type là trường bắt buộc",
    }),
    user_id: string({
      required_error: "user_id là trường bắt buộc",
    }),
    title: string({
      required_error: "title là trường bắt buộc",
    }),
    body: string({
      required_error: "body là trường bắt buộc",
    }),
    entity_name: string({
      required_error: "entity_name là trường bắt buộc",
    }),
    entity_id: string({
      required_error: "entity_id là trường bắt buộc",
    }),
  }),
});

export const NotificationUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    is_read: boolean(),
  }),
});

export const GetNotificationByCustomerIdSchema = object({
  query: object({
    customerId: string().nonempty(),
  }),
});

export type NotificationInputCreate = TypeOf<typeof NotificationCreateSchema>["body"];

export type NotificationInputUpdate = TypeOf<typeof NotificationUpdateSchema>;

export type GetNotificationByCustomerIdQuery = TypeOf<
  typeof GetNotificationByCustomerIdSchema
>["query"];
