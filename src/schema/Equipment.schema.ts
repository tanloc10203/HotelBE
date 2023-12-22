import { number, object, string, TypeOf } from "zod";

export const EquipmentCreateSchema = object({
  body: object({
    equipment_type_id: number({
      required_error: "equipment_type_id là trường bắt buộc",
    }),
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
  }),
});

export const EquipmentUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    equipment_type_id: number({
      required_error: "equipment_type_id là trường bắt buộc",
    }),
    name: string({
      required_error: "name là trường bắt buộc",
    }),
    desc: string({
      required_error: "desc là trường bắt buộc",
    }),
  }),
});

export type EquipmentInputCreate = TypeOf<typeof EquipmentCreateSchema>["body"];

export type EquipmentInputUpdate = TypeOf<typeof EquipmentUpdateSchema>;
