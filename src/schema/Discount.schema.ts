import { number, object, string, TypeOf, z } from "zod";

export const DiscountCreateSchema = object({
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
    type: z.enum(["price", "percent"], { required_error: "Loại giảm giá là trường bắt buộc" }),
  }),
});

export const DiscountUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
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
    type: z.enum(["price", "percent"], { required_error: "Loại giảm giá là trường bắt buộc" }),
  }),
});

export type DiscountInputCreate = TypeOf<typeof DiscountCreateSchema>["body"];

export type DiscountInputUpdate = TypeOf<typeof DiscountUpdateSchema>;
