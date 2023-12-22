import { object, string, TypeOf, z } from "zod";

export const RateBookingSchema = object({
  query: object({
    dateStart: string().nonempty(),
    dateEnd: string().nonempty(),
  }),
});

export const MoneyRoomSchema = object({
  query: object({
    date: string().optional(),
  }),
});

export const MoneyServiceSchema = object({
  query: object({
    type: z.enum(["service", "product"]),
    date: string().optional(),
  }),
});

export type RateBookingQuery = TypeOf<typeof RateBookingSchema>["query"];

export type MoneyRoomQuery = TypeOf<typeof MoneyRoomSchema>["query"];

export type MoneyServiceQuery = TypeOf<typeof MoneyServiceSchema>["query"];
