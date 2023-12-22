import { number, object, string, TypeOf } from "zod";

export const RoleEmployeeCreateSchema = object({
  body: object({
    employee_id: number({
      required_error: "employee_id là trường bắt buộc",
    }),
    roles: object({
      id: number({
        required_error: "role_id là trường bắt buộc",
      }),
    })
      .array()
      .nonempty("Roles không được rỗng"),
  }),
});

export const RoleEmployeeUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    employee_id: string({
      required_error: "employee_id là trường bắt buộc",
    }),
    role_id: string({
      required_error: "role_id là trường bắt buộc",
    }),
  }),
});

export type RoleEmployeeInputCreate = TypeOf<typeof RoleEmployeeCreateSchema>["body"];

export type RoleEmployeeInputUpdate = TypeOf<typeof RoleEmployeeUpdateSchema>;
