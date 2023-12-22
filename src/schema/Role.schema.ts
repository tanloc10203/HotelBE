import { number, object, string, TypeOf } from "zod";

export const RoleCreateSchema = object({
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
    permissions: object({
      id: number({ required_error: "id là trường bắt buộc" }),
      name: string({ required_error: "name là trường bắt buộc" }),
      alias: string({ required_error: "alias là trường bắt buộc" }),
      desc: string({ required_error: "name là trường bắt buộc" }).optional(),
    })
      .array()
      .nonempty({ message: "permissions không được rỗng" }),
  }),
});

export const RoleUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
    permissions: object({
      id: number({ required_error: "id là trường bắt buộc" }),
      name: string({ required_error: "name là trường bắt buộc" }),
      alias: string({ required_error: "alias là trường bắt buộc" }),
      desc: string({ required_error: "name là trường bắt buộc" }).optional(),
    })
      .array()
      .nonempty({ message: "permissions không được rỗng" }),
  }),
});

export type RoleInputCreate = TypeOf<typeof RoleCreateSchema>["body"];

export type RoleInputUpdate = TypeOf<typeof RoleUpdateSchema>;
