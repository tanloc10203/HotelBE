import { PHONE_REGEX } from "@/constants";
import { number, object, string, TypeOf, z } from "zod";

export const EmployeeCreateSchema = object({
  body: object({
    email: string({
      required_error: "email là trường bắt buộc",
    })
      .email({ message: "Vui lòng nhập email hợp lệ" })
      .nonempty("Email không được rỗng"),
    first_name: string({
      required_error: "first_name là trường bắt buộc",
    }).nonempty("Tên không được rỗng"),
    phone_number: string({
      required_error: "Số điện thoại là trường bắt buộc.",
    })
      .regex(PHONE_REGEX, "Số điện thoại không hợp lệ!")
      .nonempty("không được để trống số điện thoại"),
    last_name: string({
      required_error: "last_name là trường bắt buộc",
    }).nonempty("Họ và chữ lót không được rỗng"),
    username: string({
      required_error: "Tài khoản là trường bắt buộc",
    }).nonempty("Tài khoản không được rỗng"),
    password: string({
      required_error: "password là trường bắt buộc",
    }).nonempty("Mật khẩu không được rỗng"),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    roles: object({
      id: number({
        required_error: "role_id là trường bắt buộc",
      }),
    })
      .array()
      .nonempty("Roles không được rỗng"),
    position: string({
      required_error: "Chức vụ là trường bắt buộc",
    }).nonempty("Chức vụ không được rỗng"),
    department: string({
      required_error: "Bộ phận là trường bắt buộc",
    }).nonempty("Bộ phận không được rỗng"),
  }),
});

export const EmployeeUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    email: string({
      required_error: "email là trường bắt buộc",
    })
      .email({ message: "Vui lòng nhập email hợp lệ" })
      .nonempty("Email không được rỗng"),
    first_name: string({
      required_error: "first_name là trường bắt buộc",
    }).nonempty("Tên không được rỗng"),
    phone_number: string({
      required_error: "Số điện thoại là trường bắt buộc.",
    })
      .regex(PHONE_REGEX, "Số điện thoại không hợp lệ!")
      .nonempty("không được để trống số điện thoại"),
    last_name: string({
      required_error: "last_name là trường bắt buộc",
    }).nonempty("Họ và chữ lót không được rỗng"),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    roles: object({
      id: number({
        required_error: "role_id là trường bắt buộc",
      }),
    })
      .array()
      .nonempty("Roles không được rỗng"),
    position: string({
      required_error: "Chức vụ là trường bắt buộc",
    }).nonempty("Chức vụ không được rỗng"),
    department: string({
      required_error: "Bộ phận là trường bắt buộc",
    }).nonempty("Bộ phận không được rỗng"),
    status: z.enum(["active", "inactive", "banned", "retired"]).optional(),
  }),
});

export type EmployeeInputCreate = TypeOf<typeof EmployeeCreateSchema>["body"];

export type EmployeeInputUpdate = TypeOf<typeof EmployeeUpdateSchema>;
