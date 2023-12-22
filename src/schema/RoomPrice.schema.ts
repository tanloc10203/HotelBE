import { number, object, string, TypeOf } from "zod";

export const RoomPriceCreateSchema = object({
  body: object({
    room_id: number({
      required_error: "room_id là trường bắt buộc",
    }),
    price: number({
      required_error: "price là trường bắt buộc",
    }),
    price_booking: number({
      required_error: "price là trường bắt buộc",
    }),
    price_adults: number({
      required_error: "price là trường bắt buộc",
    }),
    price_cancel: number({
      required_error: "price là trường bắt buộc",
    }).nullable(),
    price_children: number({
      required_error: "price là trường bắt buộc",
    }).nullable(),
  }),
});

export const RoomPriceUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    room_id: number({
      required_error: "room_id là trường bắt buộc",
    }),
    price: number({
      required_error: "price là trường bắt buộc",
    }),
  }),
});

export type RoomPriceInputCreate = TypeOf<typeof RoomPriceCreateSchema>["body"];

export type RoomPriceInputUpdate = TypeOf<typeof RoomPriceUpdateSchema>;
