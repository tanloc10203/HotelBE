import { number, object, string, TypeOf, z } from "zod";
import { PriceHourSchema } from "./PriceList.schema";

export const BookingCreateSchema = object({
  body: object({
    room_id: number().nonnegative(),
    total_night: number().nonnegative(),
    customer_id: number().nonnegative(),
    first_name: string().nonempty(),
    last_name: string().nonempty(),
    email: string().nonempty(),
    phone_number: string().nonempty(),
    payment: string().nonempty(),
    check_in: string().nonempty(),
    check_out: string().nonempty(),
    adults: number().nonnegative(),
    children: number().nonnegative(),
    room_quantity: number().nonnegative(),
    voucher: string().optional(),
    note: string().optional(),
  }),
});

export const BookingUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    customer_id: string({
      required_error: "customer_id là trường bắt buộc",
    }),
    payment: string({
      required_error: "payment là trường bắt buộc",
    }),
    booking_for: string({
      required_error: "booking_for là trường bắt buộc",
    }),
    check_in: string({
      required_error: "check_in là trường bắt buộc",
    }),
    check_out: string({
      required_error: "check_out là trường bắt buộc",
    }),
    guests_adults: string({
      required_error: "guests_adults là trường bắt buộc",
    }),
    total_price: string({
      required_error: "total_price là trường bắt buộc",
    }),
    total_room: string({
      required_error: "total_room là trường bắt buộc",
    }),
    status: string({
      required_error: "status là trường bắt buộc",
    }),
  }),
});

const RoomNumberSchema = object({
  id: string().nonempty(),
  room_id: number(),
  note: string().optional(),
  status: z.enum(["maintenance", "unavailable", "available", "cleanup"]),
});

export const RoomPriceSchema = object({
  id: string().optional(),
  price_list_id: string().optional(),
  price_offline: number(),
  price_online: number(),
  room_type_id: number(),
  price_hours: PriceHourSchema.array().nonempty(),
});

const MaxPeopleSchema = object({
  adults: number(),
  children: number(),
});

const DiscountSchema = object({
  id: string(),
  price_list_id: string(),
  room_type_id: number(),

  num_discount: number(),
  code_used: number().nullable(),
  price: number(),

  time_start: string(),
  time_end: string(),

  status: z.enum(["expired", "using"]),
  is_public: number(),
});

const RoomAvailableDesktop = object({
  roomTypeId: number(),
  name: string().nonempty(),
  roomId: number(),
  character: string(),
  roomAvailable: number(),
  prices: RoomPriceSchema,
  roomNumbers: RoomNumberSchema.array().nonempty(),
  maxPeople: MaxPeopleSchema,
  quantity: number(),
  adults: number(),
  children: number(),
  roomNumberSelected: RoomNumberSchema.array().nonempty(),
  checkIn: string().nonempty(),
  checkOut: string().nonempty(),
  totalTime: number().nonnegative(),
  discount: DiscountSchema.nullable(),
  totalCost: number(),
});

export const BookingDeskTopSchema = object({
  body: object({
    rooms: RoomAvailableDesktop.array().nonempty(),
    customerId: number().nonnegative(),
    employeeId: number().nonnegative(),
    modeCheckPrice: z.enum(["time", "day"]),
    note: string().optional(),
    voucher: string().optional(),
  }),
});

export const GetBookingByCustomerSchema = object({
  query: object({
    customerId: string().nonempty(),
  }),
});

export const GetBookingDetailsSchema = object({
  query: object({
    bookingId: string().nonempty(),
  }),
});

export const PaymentBookingSchema = object({
  body: object({
    bookingId: string().nonempty(),
  }),
});

export type BookingInputCreate = TypeOf<typeof BookingCreateSchema>["body"];

export type BookingInputUpdate = TypeOf<typeof BookingUpdateSchema>;

export type BookingDeskTopInput = TypeOf<typeof BookingDeskTopSchema>["body"];

export type GetBookingByCustomerQuery = TypeOf<typeof GetBookingByCustomerSchema>["query"];

export type GetBookingDetailsQuery = TypeOf<typeof GetBookingDetailsSchema>["query"];

export type PaymentBookingInput = TypeOf<typeof PaymentBookingSchema>["body"];
