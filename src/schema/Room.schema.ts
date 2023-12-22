import { number, object, string, TypeOf, z } from "zod";
import { RoomPriceSchema } from "./Booking.schema";

export const RoomCreateSchema = object({
  body: object({
    floor_id: string({
      required_error: "Đây là trường bắt buộc",
    }),
    room_type_id: string({
      required_error: "Đây là trường bắt buộc",
    }),
    room_quantity: string({
      required_error: "Đây là trường bắt buộc",
    }),
    is_public: string().optional(),
    is_smoking: string().optional(),
    is_parking: string().optional(),
    is_breakfast: string().optional(),
    is_pets: string().optional(),
    is_extra_beds: string().optional(),
    adults: string({ required_error: "Đây là trường bắt buộc" }),
    children: string().optional(),
    area: string().optional(),
    beds: z.string(),
    room_numbers: z.string(),
    check_in_from: string(),
    check_in_to: string(),
    check_out_from: string().optional(),
    check_out_to: string(),
  }),
});

export const RoomUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    floor_id: string({
      required_error: "Đây là trường bắt buộc",
    }),
    room_type_id: string({
      required_error: "Đây là trường bắt buộc",
    }),
    room_quantity: string({
      required_error: "Đây là trường bắt buộc",
    }),
    is_public: string().optional(),
    is_smoking: string().optional(),
    is_parking: string().optional(),
    is_breakfast: string().optional(),
    is_pets: string().optional(),
    is_extra_beds: string().optional(),
    adults: string({ required_error: "Đây là trường bắt buộc" }),
    children: string().optional(),
    area: string().optional(),
    beds: z.string(),
    room_numbers: z.string(),
    check_in_from: string(),
    check_in_to: string(),
    check_out_from: string().optional(),
    check_out_to: string(),
  }),
});

export const DiscountRoomCreateSchema = object({
  body: object({
    num_discount: number({
      required_error: "Số lượng giảm giá là trường bắt buộc",
    }).nonnegative("Không được phép nhỏ hơn 0"),
    time_start: string({
      required_error: "time_start là trường bắt buộc",
    }).nonempty("Không được bỏ trống"),
    time_end: string({
      required_error: "time_end là trường bắt buộc",
    }).nonempty("Không được bỏ trống"),
    price_discount: number({
      required_error: "time_end là trường bắt buộc",
    })
      .nonnegative("Không được phép nhỏ hơn 0")
      .optional(),
    percent_discount: number({
      required_error: "time_end là trường bắt buộc",
    })
      .nonnegative("Không được phép nhỏ hơn 0")
      .min(0, "Nhỏ nhất 0%")
      .max(100, "Nhiều nhất 100%")
      .optional(),
    is_public: z.boolean({ required_error: "Đây là trường bắt buộc" }),
    room_id: number({ required_error: "Mã phòng là trường bắt buộc" }).nonnegative(
      "Không được phép âm"
    ),
    id: string().optional(),
    type: z.enum(["price", "percent"], { required_error: "Loại giảm giá là trường bắt buộc" }),
  }),
});

export const SearchingRoomAvailableSchema = object({
  body: object({
    check_in: string({
      required_error: "Check-in là trường bắt buộc",
    }).nonempty("Check-in không được bỏ trống"),
    check_out: string({
      required_error: "Check-out là trường bắt buộc",
    }).nonempty("Check-out không được bỏ trống"),
    room_id: number({
      required_error: "Check-in là trường bắt buộc",
    })
      .nonnegative("room_id không được phép nhỏ hơn 0")
      .optional(),
  }),
});

export const CheckInSchema = object({
  body: object({
    bookingDetails: object({
      id: string().nonempty(),
      room_number_id: string().nonempty(),
      room_id: number(),
      check_in: string().nonempty(),
      check_out: string().nonempty(),
      prices: RoomPriceSchema,
    })
      .array()
      .nonempty(),
    modeBooking: z.enum(["time", "day"]),
    booking_id: string().nonempty(),
    customer_id: number(),
    employee_id: number(),
    is_booked_online: z.boolean(),
  }),
});

export const GetChangeRoomsSchema = object({
  query: object({
    checkIn: string().nonempty(),
    checkOut: string().nonempty(),
    roomTypeId: string().optional(),
  }),
});

export const ChangeRoomSchema = object({
  body: object({
    roomNumber: string().nonempty(),
    bookingDetailsId: string().nonempty(),
  }),
});

export const CheckoutSchema = object({
  body: object({
    bookingDetailsId: string().nonempty(),
    billId: string().nonempty(),
    employeeId: number().nonnegative(),

    totalCostRoom: number(),
    totalCostService: number(),
    discount: number(),
    customerPay: number(),
    customerRequirePay: number(),

    paymentCost: number(),
    costLateCheckIn: number(),
    costOverCheckOut: number(),

    totalQuantityOrdered: number(),

    deposit: number(),
    change: number(),
    note: string().optional(),
  }),
});

export const GetFrontDeskSchema = object({
  query: object({
    startDate: string().optional(),
    endDate: string().optional(),
  }),
});

export const GetInfoInProgressSchema = object({
  params: object({
    bookingDetailsId: string().nonempty(),
  }),
});

export type ChangeRoomInput = TypeOf<typeof ChangeRoomSchema>["body"];
export type CheckInInput = TypeOf<typeof CheckInSchema>["body"];
export type RoomInputCreate = TypeOf<typeof RoomCreateSchema>["body"];
export type DiscountRoomCreateInput = TypeOf<typeof DiscountRoomCreateSchema>["body"];
export type RoomInputUpdate = TypeOf<typeof RoomUpdateSchema>;
export type SearchingRoomAvailableInput = TypeOf<typeof SearchingRoomAvailableSchema>["body"];
export type GetChangeRoomsQuery = TypeOf<typeof GetChangeRoomsSchema>["query"];
export type CheckoutInput = TypeOf<typeof CheckoutSchema>["body"];
export type GetFrontDeskQuery = TypeOf<typeof GetFrontDeskSchema>["query"];
export type GetInfoInProgressParams = TypeOf<typeof GetInfoInProgressSchema>["params"];
