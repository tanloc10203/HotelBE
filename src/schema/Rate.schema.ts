import { boolean, number, object, string, TypeOf } from "zod";

export const RateCreateSchema = object({
  body: object({
    booking_id: string({
      required_error: "booking_id là trường bắt buộc",
    }),
    room_id: number({
      required_error: "room_id là trường bắt buộc",
    }),
    customer_id: number({
      required_error: "customer_id là trường bắt buộc",
    }),
    start: number({
      required_error: "start là trường bắt buộc",
    }),
    comment: string({
      required_error: "comment là trường bắt buộc",
    }),
  }),
});

export const RateUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    booking_id: string({
      required_error: "booking_id là trường bắt buộc",
    }).optional(),
    room_id: string({
      required_error: "room_id là trường bắt buộc",
    }).optional(),
    customer_id: string({
      required_error: "customer_id là trường bắt buộc",
    }).optional(),
    start: string({
      required_error: "start là trường bắt buộc",
    }).optional(),
    comment: string({
      required_error: "comment là trường bắt buộc",
    }).optional(),
    is_hidden: boolean(),
  }),
});

export type RateInputCreate = TypeOf<typeof RateCreateSchema>["body"];

export type RateInputUpdate = TypeOf<typeof RateUpdateSchema>;
