import {
  ACCESS_DENIED,
  CookieHeaders,
  HEADERS_USER_TYPE,
  INVALID_USER_ID_DECODE,
  INVALID_USER_ID_DECODE_REFRESH_TOKEN,
  MISSING_ACCESS_TOKEN,
  MISSING_CLIENT_ID,
  NOT_FOUND_KEY_STORE,
  NOT_ROLES,
  REFRESH_TOKEN_MOBILE,
  ROUTE_LOGOUT_TOKEN,
  ROUTE_REFRESH_TOKEN,
  RequestHeaders,
} from "@/constants";
import { RoleEmployeeService, TokenPairService } from "@/services";
import {
  ForbiddenRequestError,
  NotFoundRequestError,
  UnAuthorizedRequestError,
  getConditions,
  verifyTokenPair,
} from "@/utils";
import { NextFunction, Response } from "express";
import { CommonRequest, UserTypes } from "types";

/**
 * @description Authorization
 * 1. Check userId missing?
 * 2. Get tokenPair
 * 3. Check origin url logout
 * 4. Check origin url refresh token
 * 5. get accessToken
 * 6. verify Token
 * 7. check user in dbs?
 * 8. check keyStore with this userId?
 * 9. Ok all => return tokenPair, userId, refreshToken => next()
 * @param type
 * @returns
 */
export const authorization = (type: UserTypes, multiple = false) => {
  return async (req: CommonRequest, res: Response, next: NextFunction) => {
    const role = req.headers[RequestHeaders.ROLES]?.toString();

    if (type === "owner" && role && role === "EMPLOYEE") {
      throw new ForbiddenRequestError(`Bạn không được phép truy cập`);
    }

    console.log(`role multiple`, { role: req.headers[RequestHeaders.ROLES], type, multiple });

    if (multiple) {
      const role = req.headers[RequestHeaders.ROLES]?.toString();

      console.log(`role multiple`, role);

      if (!role) {
        throw new ForbiddenRequestError(
          `Missing Role Request Headers! Try login again.`,
          undefined,
          MISSING_CLIENT_ID
        );
      }

      if (role === "EMPLOYEE") type = "employee";
      else if (role === "OWNER") type = "owner";

      req.role = role as `EMPLOYEE` | "OWNER";
    }

    console.log(`------------------------------------`);
    console.log(`path `, req.originalUrl);

    console.log(`\nauthorization type `, type);

    const HEADERS = HEADERS_USER_TYPE[type];
    const ORIGIN_ROUTE_REFRESH_TOKEN = ROUTE_REFRESH_TOKEN[type];
    const ORIGIN_ROUTE_LOGOUT_TOKEN = ROUTE_LOGOUT_TOKEN[type];

    // console.log(`\nHEADER`, HEADERS);
    // console.log(`------------------------------------`);

    const userId = req.cookies[HEADERS.X_CLIENT_ID]?.toString();

    if (!userId) {
      throw new ForbiddenRequestError(
        `Missing x-client-id Request Headers! Try login again.`,
        undefined,
        MISSING_CLIENT_ID
      );
    }

    const conditions = getConditions(userId, type);

    // console.log(`\conditions`, conditions);

    const tokenPair = await TokenPairService.findOne(conditions);

    // console.log(`\ntokenPair`, tokenPair);

    if (!tokenPair) {
      throw new NotFoundRequestError(
        "Key Store Not Found. Because x-client-id invalid.",
        undefined,
        NOT_FOUND_KEY_STORE
      );
    }

    if (req.originalUrl === ORIGIN_ROUTE_LOGOUT_TOKEN) {
      req.tokenPair = tokenPair;
      req.userId = userId;

      return next();
    }

    const refreshTokenWithoutCookie = req.headers[HEADERS.REFRESH_TOKEN]?.toString();

    if (req.originalUrl === ORIGIN_ROUTE_REFRESH_TOKEN) {
      const refreshToken =
        refreshTokenWithoutCookie ?? req.cookies[HEADERS.REFRESH_TOKEN]?.toString();

      if (refreshToken) {
        const decode = verifyTokenPair<{ id: number }>(refreshToken, tokenPair.private_key);

        if (+userId !== +decode.id) {
          throw new ForbiddenRequestError(
            "Invalid userId decode refreshToken. Try login again",
            undefined,
            INVALID_USER_ID_DECODE_REFRESH_TOKEN
          );
        }

        req.tokenPair = tokenPair;
        req.userId = userId;
        req.refreshToken = refreshToken;

        return next();
      }
    }

    const accessToken = req.headers[HEADERS.AUTHORIZATION]?.toString();

    if (!accessToken) {
      throw new UnAuthorizedRequestError(
        "Missing token. Try login again.",
        undefined,
        MISSING_ACCESS_TOKEN
      );
    }

    // console.log({ accessToken, tokenPair });

    const decode = verifyTokenPair<{ id: number }>(accessToken, tokenPair.public_key);

    if (+decode.id !== +userId) {
      throw new ForbiddenRequestError(
        "Invalid userId decode. Try login again",
        undefined,
        INVALID_USER_ID_DECODE
      );
    }

    req.tokenPair = tokenPair;
    req.userId = userId;

    return next();
  };
};

export const authorizationMobile = async (
  req: CommonRequest,
  res: Response,
  next: NextFunction
) => {
  let userId: string | undefined | number =
    req.headers[CookieHeaders.X_CLIENT_ID_CUSTOMER]?.toString();

  if (!userId) {
    throw new ForbiddenRequestError(
      `Missing x-client-id Request Headers! Try login again.`,
      undefined,
      MISSING_CLIENT_ID
    );
  }

  userId = parseInt(userId);

  // console.log(`userID `, userId);

  if (!userId) {
    throw new ForbiddenRequestError(`UserId invalid int`, undefined, MISSING_CLIENT_ID);
  }

  const tokenPair = await TokenPairService.findOne({ customer_id: userId });

  // console.log(`tokenPair`, tokenPair);

  if (!tokenPair) {
    throw new NotFoundRequestError(
      "Key Store Not Found. Because x-client-id invalid.",
      undefined,
      NOT_FOUND_KEY_STORE
    );
  }

  // console.log(`req.originalUrl`, req.originalUrl);

  if (req.originalUrl === "/api/v1/Customers/LogoutMobile") {
    req.tokenPair = tokenPair;
    req.userId = userId;

    return next();
  }

  if (req.originalUrl === REFRESH_TOKEN_MOBILE) {
    const refreshToken = req.headers[CookieHeaders.REFRESH_TOKEN_CUSTOMER]?.toString();

    if (refreshToken) {
      const decode = verifyTokenPair<{ id: number }>(refreshToken, tokenPair.private_key);

      if (userId !== +decode.id) {
        throw new ForbiddenRequestError(
          "Invalid userId decode refreshToken. Try login again",
          undefined,
          INVALID_USER_ID_DECODE_REFRESH_TOKEN
        );
      }

      req.tokenPair = tokenPair;
      req.userId = userId;
      req.refreshToken = refreshToken;

      return next();
    }
  }

  const accessToken = req.headers[RequestHeaders.ACCESS_TOKEN_CUSTOMER]?.toString();

  if (!accessToken) {
    throw new UnAuthorizedRequestError(
      "Missing token. Try login again.",
      undefined,
      MISSING_ACCESS_TOKEN
    );
  }

  // console.log(`accessToken`, accessToken);

  const decode = verifyTokenPair<{ id: number }>(accessToken, tokenPair.public_key);

  // console.log(`decode`, decode);

  if (+decode.id !== userId) {
    throw new ForbiddenRequestError(
      "Invalid userId decode. Try login again",
      undefined,
      INVALID_USER_ID_DECODE
    );
  }

  req.tokenPair = tokenPair;
  req.userId = userId;

  return next();
};

export const authPermissions = (permissionAlias: string, isOwner = false) => {
  return async (req: CommonRequest, res: Response, next: NextFunction) => {
    console.log("====================================");
    console.log({ permissionAlias, isOwner, req: req.role });
    console.log("====================================");

    if (req.role === "OWNER" || isOwner) return next();
    const employeeId = req.userId;

    console.log(`role`, req.role);

    const roles = await RoleEmployeeService.getByEmployeeId(employeeId!);

    const roleLength = roles?.length;

    console.log(`role`, roles);

    if (!roleLength) {
      throw new ForbiddenRequestError(`Bạn chưa được cấp quyền truy cập`, undefined, NOT_ROLES);
    }

    for (let index = 0; index < roleLength; index++) {
      const { permissions } = roles[index];

      const indexPermission = permissions.findIndex(
        (permission) => permission.alias === permissionAlias
      );

      if (indexPermission !== -1) {
        return next();
      }
    }

    throw new ForbiddenRequestError(`Bạn không được phép truy cập 1`, undefined, ACCESS_DENIED);
  };
};
