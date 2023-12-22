export type MomoPaymentType = "pr" | "webApp" | "credit" | "napas";

export type CollectionLinkResponse = {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl: string;
  shortLink: string;
  deeplink?: string;
  qrCodeUrl?: string;
};

export type MomoPaymentResponse = {
  signature: string;
  extraData: string;
  payType: MomoPaymentType;
  transId: number;
  orderType: "momo_wallet";
  partnerUserId?: string;
  orderInfo: string;
} & Pick<
  CollectionLinkResponse,
  "partnerCode" | "orderId" | "requestId" | "amount" | "resultCode" | "responseTime" | "message"
>;
