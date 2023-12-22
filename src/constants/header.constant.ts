import { CookieOptions } from "express";

export enum CookieHeaders {
  REFRESH_TOKEN_CUSTOMER = "_rfc",
  REFRESH_TOKEN_OWNER = "_rfo",
  REFRESH_TOKEN_EMPLOYEE = "_rfe",
  X_CLIENT_ID_CUSTOMER = "c_customer",
  X_CLIENT_ID_OWNER = "c_owner",
  X_CLIENT_ID_EMPLOYEE = "c_employee",
  X_API_KEY_CUSTOMER = "_xkc",
  X_API_KEY_OWNER = "_xko",
  X_API_KEY_EMPLOYEE = "_xke",
}

export enum RequestHeaders {
  ACCESS_TOKEN_CUSTOMER = "_acc",
  ACCESS_TOKEN_OWNER = "_aco",
  ACCESS_TOKEN_EMPLOYEE = "_ace",
  ROLES = "xxxxxx",
}

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "production" ? false : true,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: 3.154e10, // 1 year
};

export const HEADERS_USER_TYPE = {
  customer: {
    X_CLIENT_ID: CookieHeaders.X_CLIENT_ID_CUSTOMER,
    REFRESH_TOKEN: CookieHeaders.REFRESH_TOKEN_CUSTOMER,
    X_API_KEY: CookieHeaders.X_API_KEY_CUSTOMER,
    AUTHORIZATION: RequestHeaders.ACCESS_TOKEN_CUSTOMER,
  },
  employee: {
    X_CLIENT_ID: CookieHeaders.X_CLIENT_ID_EMPLOYEE,
    REFRESH_TOKEN: CookieHeaders.REFRESH_TOKEN_EMPLOYEE,
    X_API_KEY: CookieHeaders.X_API_KEY_EMPLOYEE,
    AUTHORIZATION: RequestHeaders.ACCESS_TOKEN_EMPLOYEE,
  },
  owner: {
    X_CLIENT_ID: CookieHeaders.X_CLIENT_ID_OWNER,
    REFRESH_TOKEN: CookieHeaders.REFRESH_TOKEN_OWNER,
    X_API_KEY: CookieHeaders.X_API_KEY_OWNER,
    AUTHORIZATION: RequestHeaders.ACCESS_TOKEN_OWNER,
  },
};
