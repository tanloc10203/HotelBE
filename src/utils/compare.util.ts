import { INVALID_SIGNATURE, JWT_EXPIRED } from "@/constants";
import bcrypt from "bcrypt";
import JWT, { JwtPayload } from "jsonwebtoken";
import { UnAuthorizedRequestError } from "./error.util";
import dayjs from "dayjs";

export const compareHashPassword = async (password: string, passwordHash: string) => {
  return await bcrypt.compare(password, passwordHash);
};

export const verifyTokenPair = <T extends object>(token: string, secureKey: string) => {
  try {
    const decode = JWT.verify(token, secureKey);
    return decode as T & JwtPayload;
  } catch (error: any) {
    const code =
      error.message === "invalid signature"
        ? INVALID_SIGNATURE
        : error.message === "jwt expired"
        ? JWT_EXPIRED
        : undefined;

    // console.log(`error verifyTokenPair `, { token, secureKey, message: error?.message });

    throw new UnAuthorizedRequestError(error.message, undefined, code);
  }
};

export const compareDateVoucher = (startDate: string | Date, endDate: string | Date) => {
  const _startDate = dayjs(new Date(startDate));
  const _endDate = dayjs(new Date(endDate));
  const compare = _endDate.diff(_startDate, "h", true);
  return compare;
};
