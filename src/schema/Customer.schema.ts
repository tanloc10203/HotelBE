import { PHONE_REGEX } from "@/constants";
import { object, string, TypeOf, z } from "zod";

export const CustomerCreateSchema = object({
  body: object({
    first_name: string({
      required_error: "first_name là trường bắt buộc.",
    }),
    last_name: string({
      required_error: "last_name là trường bắt buộc.",
    }),
    username: string({
      required_error: "username là trường bắt buộc.",
    }),
    phone_number: string({
      required_error: "phone_number là trường bắt buộc.",
    }),
    password: string({
      required_error: "password là trường bắt buộc.",
    })
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự."),
    email: string({
      required_error: "Email là trường bắt buộc.",
    }).email({ message: "Email không hợp hợp lý." }),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]).optional(),
  }),
});

export const CustomerCreateMobileSchema = object({
  body: object({
    phone_number: string({
      required_error: "Số điện thoại là trường bắt buộc.",
    })
      .regex(PHONE_REGEX, "Số điện thoại không hợp lệ!")
      .nonempty("không được để trống số điện thoại"),
    password: string({
      required_error: "Mật khẩu là trường bắt buộc.",
    })
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự.")
      .nonempty("Không được để trống mật khẩu"),
  }),
});

export const CustomerVerifyCodeMobileSchema = object({
  body: object({
    api_key: string({
      required_error: "ApiKey là trường bắt buộc.",
    }).nonempty("không được để trống số điện thoại"),
    user_id: string({
      required_error: "UserId là trường bắt buộc.",
    }).nonempty("Không được để trống mật khẩu"),
    otp: string({
      required_error: "Mã xác thực là trường bắt buộc",
    }).nonempty("Không được để trống mã xác thực"),
  }),
});

export const CustomerUpdateProfileMobileSchema = object({
  params: object({
    userId: string({
      required_error: "UserId là trường bắt buộc.",
    }).nonempty("Không được để trống UserId"),
  }),
  body: object({
    first_name: string({
      required_error: "Tên là trường bắt buộc.",
    }).nonempty("Không được để trống Tên"),
    last_name: string({
      required_error: "Họ và chữ lót là trường bắt buộc.",
    }).nonempty("Không được để trống họ và chữ lót"),
    email: string({
      required_error: "Email là trường bắt buộc.",
    })
      .email({ message: "Email không hợp hợp lý." })
      .nonempty("Không được để email"),
    gender: z.enum(["MALE", "FEMALE"]),
  }),
});

export const CustomerResendCodeMobileSchema = object({
  body: object({
    api_key: string({
      required_error: "ApiKey là trường bắt buộc.",
    }).nonempty("không được để trống số điện thoại"),
    user_id: string({
      required_error: "UserId là trường bắt buộc.",
    }).nonempty("Không được để trống mật khẩu"),
  }),
});

export const CheckStatusCustomerSchema = object({
  params: object({
    userId: string({
      required_error: "UserId là trường bắt buộc.",
    }).nonempty("Không được để trống UserId"),
  }),
});

export const CustomerUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc.",
    }),
  }),
  body: object({
    first_name: string({
      required_error: "first_name là trường bắt buộc.",
    }),
    last_name: string({
      required_error: "last_name là trường bắt buộc.",
    }),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]).optional(),
    desc: z
      .string({ required_error: "Mô tả là trường bắt buộc." })
      .nonempty("Mô tả không được để trống.")
      .optional(),
    address: z
      .string({ required_error: "Địa chỉ là trường bắt buộc." })
      .nonempty("Địa chỉ không được để trống.")
      .optional(),
    birth_date: z
      .string({ required_error: "Địa chỉ là trường bắt buộc." })
      .nonempty("Ngày sinh không được để trống.")
      .optional(),
    phone_number: z
      .string({ required_error: "Số điện thoại là trường bắt buộc." })
      .nonempty("Ngày sinh không được để trống.")
      .optional(),
  }),
});

export const AddFromFrontDeskSchema = object({
  body: object({
    first_name: string().nonempty(),
    last_name: string().nonempty(),
    phone_number: z.string().nonempty(),

    birth_date: z.string().nullable().optional(),

    email: string().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]).optional(),
    desc: z.string().optional(),

    address: z.string().optional(),
  }),
});

export type CustomerInputCreate = TypeOf<typeof CustomerCreateSchema>["body"];

export type CustomerInputUpdate = TypeOf<typeof CustomerUpdateSchema>;

export type CustomerCreateMobileInput = TypeOf<typeof CustomerCreateMobileSchema>["body"];

export type CustomerVerifyCodeMobileInput = TypeOf<typeof CustomerVerifyCodeMobileSchema>["body"];

export type CustomerResendCodeMobileInput = TypeOf<typeof CustomerResendCodeMobileSchema>["body"];

export type CustomerUpdateProfileMobileInput = TypeOf<typeof CustomerUpdateProfileMobileSchema>;

export type CheckStatusCustomerInput = TypeOf<typeof CheckStatusCustomerSchema>;

export type AddFromFrontDeskInput = TypeOf<typeof AddFromFrontDeskSchema>["body"];
