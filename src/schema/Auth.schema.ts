import { object, string, TypeOf, z } from "zod";

export const AuthLoginSchema = object({
  body: object({
    username: string({
      required_error: "username là trường bắt buộc",
    }).nonempty("Không được để tróng"),
    password: string({
      required_error: "password là trường bắt buộc",
    })
      .nonempty("Không được để tróng")
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
  }),
});

export const AuthChangePasswordSchema = object({
  body: object({
    password: string({
      required_error: "Mật khẩu cũ là trường bắt buộc",
    })
      .nonempty("Không được để tróng")
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
    newPassword: string({
      required_error: "Mật khẩu mới là trường bắt buộc",
    })
      .nonempty("Không được để tróng")
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
  }),
});

export const AuthForgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: "Email là trường bắt buộc",
    })
      .nonempty("Không được để trống địa chỉ email")
      .email("Địa chỉ email không hợp lệ"),
    username: string({
      required_error: "Tài khoản là trường bắt buộc",
    }).nonempty("Không được để trống tài khoản"),
  }),
});

export const AuthResetPasswordSchema = object({
  params: object({
    id: string({
      required_error: "User Id là trường bắt buộc",
    }).nonempty("Không được để trống User Id"),
    token: string({
      required_error: "Token là trường bắt buộc",
    }).nonempty("Không được để trống Token"),
  }),
  body: object({
    password: string({
      required_error: "Mật khẩu là trường bắt buộc",
    })
      .nonempty("Không được để tróng")
      .min(5, "Mật khẩu ít nhất 5 kí tự")
      .max(32, "Mật khẩu nhiều nhất 32 kí tự"),
  }),
});

export const AuthVerifyAccountSchema = object({
  params: object({
    id: string({
      required_error: "User Id là trường bắt buộc",
    }).nonempty("Không được để trống User Id"),
  }),
});

export const AuthChangeAvatarSchema = object({
  files: z.record(z.string()).array(),
});

export type AuthLoginInputCreate = TypeOf<typeof AuthLoginSchema>["body"];
export type AuthChangePasswordInput = TypeOf<typeof AuthChangePasswordSchema>["body"];
export type AuthForgotPasswordInput = TypeOf<typeof AuthForgotPasswordSchema>["body"];
export type AuthResetPasswordParams = TypeOf<typeof AuthResetPasswordSchema>;
export type AuthVerifyAccountParams = TypeOf<typeof AuthVerifyAccountSchema>["params"];
export type AuthChangeAvatarFile = TypeOf<typeof AuthChangeAvatarSchema>["files"];
