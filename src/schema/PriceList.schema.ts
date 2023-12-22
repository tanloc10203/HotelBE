import { boolean, number, object, string, TypeOf, z } from "zod";

export const PriceHourSchema = object({
  id: number().optional(),
  room_price_id: string().optional(),
  price: number(),
  room_type_id: number(),
  start_hour: number(),
});

export const RoomTypeSchema = object({
  id: number(),
  prices: object({
    id: string().optional(),
    price_list_id: string().optional(),
    price_offline: number(),
    price_online: number(),
    room_type_id: number(),
    price_hours: PriceHourSchema.array().nonempty(),
  }),
});

export const RoomTypeDiscountSchema = object({
  id: number(),
  discount: object({
    id: string().optional(),
    code_used: number(),
    is_public: boolean(),
    num_discount: number(),
    price: number(),
    price_list_id: string(),
    room_type_id: number(),
    status: z.enum(["using", "expired"]),
    time_end: string(),
    time_start: string(),
  }),
});

export const PriceListCreateSchema = object({
  body: object({
    name: string().nonempty(),
    start_time: string().nonempty(),
    end_time: string().nonempty(),
    description: string().optional(),
    is_default: boolean(),
    type: z.enum(["service", "product", "room", "discount"]),
    roomTypes: RoomTypeSchema.array().nonempty(),
  }),
});

export const PriceListCreateDiscountSchema = object({
  body: object({
    name: string().nonempty(),
    start_time: string().nonempty(),
    end_time: string().nonempty(),
    description: string().optional(),
    is_default: boolean(),
    type: z.enum(["service", "product", "room", "discount"]),
    roomTypes: RoomTypeDiscountSchema.array().nonempty(),
  }),
});

export const PriceListUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string().nonempty(),
    start_time: string().nonempty(),
    end_time: string().nonempty(),
    description: string().optional(),
    is_default: boolean(),
    type: z.enum(["service", "product", "room", "discount"]),
    roomTypes: RoomTypeSchema.array().nonempty(),
  }),
});

export const PriceListUpdateDiscountSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string().nonempty(),
    start_time: string().nonempty(),
    end_time: string().nonempty(),
    description: string().optional(),
    is_default: boolean(),
    type: z.enum(["service", "product", "room", "discount"]),
    roomTypes: RoomTypeDiscountSchema.array().nonempty(),
  }),
});

export type PriceListInputCreate = TypeOf<typeof PriceListCreateSchema>["body"];

export type PriceListInputCreateDiscount = TypeOf<typeof PriceListCreateDiscountSchema>["body"];

export type PriceListInputUpdate = TypeOf<typeof PriceListUpdateSchema>;

export type PriceListInputUpdateDiscount = TypeOf<typeof PriceListUpdateDiscountSchema>;
