import { number, object, string, TypeOf } from "zod";

export const RoomTypeCreateSchema = object({
  body: object({
    name: string({}).nonempty(),
    character: string({}).nonempty(),
    desc: string({}).nonempty(),
    equipments: string().nonempty(),
    amenities: string().nonempty(),
  }),
});

export const RoomTypeUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    name: string({}).nonempty(),
    character: string({}).nonempty(),
    desc: string({}).nonempty(),
    equipments: string().nonempty(),
    amenities: string().nonempty(),
  }),
});

export type RoomTypeInputCreate = TypeOf<typeof RoomTypeCreateSchema>["body"];

export type RoomTypeInputUpdate = TypeOf<typeof RoomTypeUpdateSchema>;
