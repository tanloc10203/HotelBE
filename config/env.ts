import "dotenv/config";
import { cleanEnv, str, num, url } from "envalid";

const env = cleanEnv(process.env, {
  /**
   * ==================================
   * Application
   * ==================================
   */
  APP_PORT: num({ default: 8888 }),
  APP_SECRET_SESSION: str({ default: "private_sessions_abc!!@@" }),

  /**
   * ==================================
   * Client
   * ==================================
   */
  CLIENT_ORIGIN_WEB: str({ default: "http://localhost:3000" }),
  CLIENT_ORIGIN_MOBILE: str({ default: "http://192.168.1.12:8081" }),

  /**
   * ==================================
   * Database
   * ==================================
   */
  DB_HOST: str({ default: "localhost" }),
  DB_USERNAME: str({ default: "root" }),
  DB_PASSWORD: str({ default: "" }),
  DB_NAME: str({ default: "example" }),
  DB_PORT: num({ default: 3306 }),
  DB_CONNECT_POOL: num({ default: 10 }),

  /**
   * ==================================
   * Log
   * ==================================
   */
  FOLDER_ROOT_LOG: str({ default: "logs" }),

  /**
   * ==================================
   * Expires Secure Token
   * ==================================
   */
  EXPIRES_IN_PUBLIC_KEY: str({ default: "30s" }),
  EXPIRES_IN_PRIVATE_KEY: str({ default: "2d" }),
  EXPIRES_IN_RESET_PASSWORD: str({ default: "30s" }),

  /**
   * ==================================
   * Email Service
   * ==================================
   */
  EMAIL_ADDRESS: str({ default: "example@gmail.com" }),
  EMAIL_PASSWORD: str({ default: "example" }),
  EMAIL_TITLE: str({ default: "" }),

  /**
   * ==================================
   * Cloudinary Service
   * ==================================
   */
  CLOUDINARY_NAME: str({ default: "" }),
  CLOUDINARY_API_KEY: str({ default: "" }),
  CLOUDINARY_SECRET: str({ default: "" }),
  CLOUDINARY_URI: url({ default: "" }),

  /**
   * ==================================
   * Twilio Service
   * ==================================
   */
  TWILIO_ACCOUNT_SID: str({ default: "" }),
  TWILIO_AUTH_TOKEN: str({ default: "" }),
  TWILIO_NUMBER: str({ default: "" }),

  /**
   * ==================================
   * Momo
   * ==================================
   */
  MOMO_URL: str({ default: "https://test-payment.momo.vn" }),
  MOMO_ACCESS_KEY: str({ default: "" }),
  MOMO_SECRET_KEY: str({ default: "" }),

  /**
   * ==================================
   * ZaloPay
   * ==================================
   */
  ZALO_PAY_APP_ID: str({ default: "2554" }),
  ZALO_PAY_KEY1: str({ default: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn" }),
  ZALO_PAY_KEY2: str({ default: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf" }),
  ZALO_PAY_ENDPOINT: str({ default: "https://sb-openapi.zalopay.vn/v2" }),

  /**
   * Mobile
   */
  MOBILE_PORT: str({ default: "8081" }),
});

export default env;
