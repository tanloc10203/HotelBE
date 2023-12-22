import { object, string, TypeOf } from "zod";

export const RoomNumberCreateSchema = object({
  body: object({
    room_id: string({
      required_error: "room_id là trường bắt buộc",
    }),
    id: string({
      required_error: "room_id là trường bắt buộc",
    }),
  }),
});

export const RoomNumberUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    room_id: string({
      required_error: "room_id là trường bắt buộc",
    }),
    id: string({
      required_error: "room_id là trường bắt buộc",
    }),
  }),
});

export type RoomNumberInputCreate = TypeOf<typeof RoomNumberCreateSchema>["body"];

export type RoomNumberInputUpdate = TypeOf<typeof RoomNumberUpdateSchema>;
