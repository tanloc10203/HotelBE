import { number, object, string, TypeOf, z } from "zod";

export const GuestStayInformationCreateSchema = object({
  body: object({
    booking_details_id: string().nonempty(),
    room_number: string().nonempty(),

    full_name: string().nonempty(),
    nationality: string().nonempty(),
    identification_type: z.enum(["passport", "cccd", "cmnd", "others", "cavet_xe"]),
    identification_value: string().nonempty(),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]).optional(),
    note: string().optional(),
    birthday: string().nullable().optional(),

    filters: object({
      checkIn: string().nonempty(),
      checkOut: string().nonempty(),
      modeBooking: z.enum(["time", "day"]),
      roomNumber: string().nonempty(),
      customerId: number().optional(),
      bookingDetailsId: string().optional(),
      status: z.enum([
        "pending_payment",
        "confirmed",
        "pending_confirmation",
        "canceled",
        "checked_out",
        "in_progress",
        "completed",
      ]),
    }).optional(),
  }),
});

export const GuestStayInformationUpdateSchema = object({
  params: object({
    id: string(),
  }),
  body: object({
    booking_details_id: string().nonempty(),
    room_number: string().nonempty(),

    full_name: string().nonempty(),
    nationality: string().nonempty(),
    identification_type: z.enum(["passport", "cccd", "cmnd", "others", "cavet_xe"]),
    identification_value: string().nonempty(),
    gender: z.enum(["MALE", "FEMALE", "OTHERS"]).optional(),
    note: string().optional(),
    birthday: string().nullable().optional(),
  }),
});

export type GuestStayInformationInputCreate = TypeOf<
  typeof GuestStayInformationCreateSchema
>["body"];

export type GuestStayInformationInputUpdate = TypeOf<typeof GuestStayInformationUpdateSchema>;
