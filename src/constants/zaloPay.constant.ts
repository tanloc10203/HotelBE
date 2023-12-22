import { env } from "config";

// APP INFO
export const configZaloPay = {
  appId: env.ZALO_PAY_APP_ID,
  key1: env.ZALO_PAY_KEY1,
  key2: env.ZALO_PAY_KEY2,
  endpoint: env.ZALO_PAY_ENDPOINT,

  bankCode: {
    qr: "",
    appToApp: "",
    mobileWebToApp: "zalopayapp",
    visaMasterJCB: "36",
    bankAccount: "37",
    zaloPay: "38",
    atm: "39",
    visaMaterDebit: "41",
  },
} as const;
