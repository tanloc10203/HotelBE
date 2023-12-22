import { CookieHeaders, ERROR_MESSAGE_MULTER, RequestHeaders } from "@/constants";
import { ReasonPhrases, StatusCodes } from "@/core";
import { mysql } from "@/database";
import { removeImageV2 } from "@/lib";
import { ErrorResponse, NotFoundRequestError, logger } from "@/utils";
import compression, { CompressionOptions } from "compression";
import { env } from "config";
import { CorsOptions } from "cors";
import { Application, NextFunction, Request, Response } from "express";
import mysqlSession from "express-mysql-session";
import * as Session from "express-session";
import { MulterError } from "multer";
import { CommonRequest } from "types";

class AppMiddleware {
  protected cors(origin: string | string[]): CorsOptions {
    return {
      allowedHeaders: [
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type, Accept,Authorization,Origin",
        RequestHeaders.ACCESS_TOKEN_CUSTOMER,
        RequestHeaders.ACCESS_TOKEN_EMPLOYEE,
        RequestHeaders.ACCESS_TOKEN_OWNER,
        RequestHeaders.ROLES,
        CookieHeaders.REFRESH_TOKEN_EMPLOYEE,
        CookieHeaders.REFRESH_TOKEN_OWNER,
      ],
      credentials: true,
      origin: origin,
      methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    };
  }

  protected compression(): CompressionOptions {
    return {
      level: 6,
      threshold: 100 * 1000,
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false;
        }

        return compression.filter(req, res);
      },
    };
  }

  protected catchError404Resource(_req: Request, _res: Response, next: NextFunction) {
    // console.log(`req`, _req);

    const error = new NotFoundRequestError("Resource not found!");
    return next(error);
  }

  protected async catchErrorInterValServer(
    error: ErrorResponse,
    req: CommonRequest,
    res: Response,
    _next: NextFunction
  ) {
    if (req?.imageId) {
      const { imageId } = req;

      if (Array.isArray(imageId)) {
        await Promise.all(
          imageId.map(
            (image) =>
              new Promise(async (resolve, reject) => {
                try {
                  await removeImageV2(image);
                  resolve(true);
                } catch (error) {
                  reject(error);
                }
              })
          )
        );
      } else {
        await removeImageV2(imageId);
      }
    }

    if (error instanceof MulterError) {
      return res.status(StatusCodes.IM_A_TEAPOT).json({
        status: "error",
        code: StatusCodes.IM_A_TEAPOT,
        message: ERROR_MESSAGE_MULTER[error.code],
        others_message: error.others ?? null,
        exception: null,
      });
    }

    const methods = req.method;
    const path = req.originalUrl;
    logger.error(`[${methods}: ${path}] ${error}`);

    const status = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || ReasonPhrases.INTERNAL_SERVER_ERROR;
    const code = error.code ?? null;

    return res.status(status).json({
      status: status,
      code: code,
      message,
      others_message: error.others ?? null,
      exception: error.stack,
    });
  }

  protected expressSession(app: Application) {
    const connection = mysql.connection;
    const MySQLStore = mysqlSession(Session);

    // @ts-ignore
    const sessionStore = new MySQLStore(undefined, connection);

    let options: Session.SessionOptions = {
      secret: env.APP_SECRET_SESSION,
      store: sessionStore,
      name: "sid",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 3.154e10,
      },
    };

    if (app.get("env") === "production") {
      options = {
        ...options,
        proxy: true,
        cookie: {
          ...options.cookie,
          secure: true,
          sameSite: "none",
        },
      };
    }

    sessionStore
      .onReady()
      .then(() => console.log("MySQLStore session ready"))
      .catch((error) => console.error(error));

    return Session.default(options);
  }
}

export default AppMiddleware;
