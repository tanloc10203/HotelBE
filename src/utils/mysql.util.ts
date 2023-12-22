import { FORMAT_DATETIME_SQL } from "@/constants";
import dayjs from "dayjs";
import moment from "moment";
import { raw } from "mysql2/promise";

export const isNotNull = () => raw("IS NOT NULL");

export const isNot = (value: any) => raw(`IS NOT '${value}'`);

export const notIn = (value: any) => raw(`NOT IN ('${value}')`);

export const isNull = () => raw("IS NULL");

export const isRather = (value: any) => raw(`>= '${value}'`);

export const isLess = (value: any) => raw(`<= '${value}'`);

export const isBetween = (start: any, end: any) => raw(`BETWEEN '${start}' AND '${end}'`);

export const rawLike = (text: string) => raw(`LIKE '%${text}%'`);

export const dateFormat = (date?: Date | string, format = FORMAT_DATETIME_SQL) =>
  moment(date ? new Date(date) : undefined).format(format);

export const dateTimeSql = (date?: Date | string, format = FORMAT_DATETIME_SQL) =>
  dateFormat(date, format);

export const dateFormatSql = (date?: Date | string, format = "YYYY-MM-DD") =>
  dateFormat(date, format);

export const dateTimeSqlV2DayJS = (date?: Date | string) =>
  dayjs(date ? date : undefined).format(FORMAT_DATETIME_SQL);

export const isBoolean = (value: boolean) => raw(`${value}`);

export const isNumber = (value: number) => raw(`${value}`);

export const parserBoolean = (value: number) => Boolean(+value === 1);
