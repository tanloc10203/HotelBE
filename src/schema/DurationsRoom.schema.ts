import { number, object, string, TypeOf } from "zod";

export const DurationsRoomCreateSchema = object({
  body: object({
    room_id: number({
      required_error: "room_id là trường bắt buộc",
    }),
    check_in_from: string({
      required_error: "check_in_from là trường bắt buộc",
    }),
    check_in_to: string({
      required_error: "check_in_to là trường bắt buộc",
    }),
    check_out_to: string({
      required_error: "check_out_to là trường bắt buộc",
    }),
    check_out_from: string({
      required_error: "check_out_to là trường bắt buộc",
    }).optional(),
  }),
});

export const DurationsRoomUpdateSchema = object({
  params: object({
    id: string({
      required_error: "Id là tham số bắt buộc",
    }),
  }),
  body: object({
    room_id: number({
      required_error: "room_id là trường bắt buộc",
    }),
    check_in_from: string({
      required_error: "check_in_from là trường bắt buộc",
    }),
    check_in_to: string({
      required_error: "check_in_to là trường bắt buộc",
    }),
    check_out_to: string({
      required_error: "check_out_to là trường bắt buộc",
    }),
    check_out_from: string({
      required_error: "check_out_to là trường bắt buộc",
    }).optional(),
  }),
});

export type DurationsRoomInputCreate = TypeOf<typeof DurationsRoomCreateSchema>["body"];

export type DurationsRoomInputUpdate = TypeOf<typeof DurationsRoomUpdateSchema>;
