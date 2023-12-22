import { NetworkHelper } from "@/helpers";
import { CollectionLinkResponse } from "@/models";
import { decodeBase64 } from "@/utils";
import axios from "axios";
import { env } from "config";
import crypto from "node:crypto";
import MomoTransactionService from "./MomoTransaction.service";

const accessKey = env.MOMO_ACCESS_KEY;
const secretKey = env.MOMO_SECRET_KEY;
// const ipnUrl = "https://endcool-api.onrender.com/response-momo";

type CollectionLinkPayload = {
  orderId: string;
  orderInfo: string;
  amount: number;
  orderExpireTime?: number;
  partnerCode: "MOMO";
  bookingId?: string;
  bookingDetailsId?: string;
  extraData?: string;
};

class MomoService {
  static collectionLink = async ({
    amount,
    orderId,
    orderInfo,
    bookingId,
    partnerCode,
    bookingDetailsId,
    orderExpireTime = 15,
    extraData = "",
  }: CollectionLinkPayload) => {
    const network = new NetworkHelper();
    const host = network.getLanHost();
    console.log({ accessKey, secretKey });

    const ipnUrl = `http://localhost:${env.APP_PORT}/api/v1/response-payment`;
    const redirectUrl = `exp://${host}:8081/--/success`;

    const requestType = "payWithMethod";
    // const requestType = "captureWallet";
    const requestId = orderId;
    const autoCapture = true;
    const lang = "vi";

    const rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;

    var signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const requestBody = {
      partnerCode: partnerCode,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      signature: signature,
      orderExpireTime: orderExpireTime,
    };

    const URL = `${env.MOMO_URL}/v2/gateway/api/create`;

    const [responseAxios] = await Promise.all([
      axios.post(URL, requestBody, {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
        },
      }),
      MomoTransactionService.create({
        id: orderId,
        order_id: orderId,
        partner_code: partnerCode,
        request_id: requestId,
        amount,
        lang,
        order_info: orderInfo,
        status: "pending",
        signature,
        request_type: requestType,
        booking_details_id: bookingDetailsId || null,
        booking_id: bookingId || null,
      }),
    ]);

    const response: CollectionLinkResponse = responseAxios.data;

    console.log(`response`, response);

    await MomoService.checkStatusTrans(orderId);

    return response.payUrl;
  };

  static refund = async ({ orderId, transId }: { orderId: string; transId: number }) => {
    var description = "";
    var partnerCode = "MOMO";
    var amount = "50000";
    var requestId = orderId;
    var lang = "vi";

    var rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&description=" +
      description +
      "&orderId=" +
      orderId +
      "&partnerCode=" +
      partnerCode +
      "&requestId=" +
      requestId +
      "&transId=" +
      transId;

    var signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const requestBody = {
      partnerCode,
      orderId,
      requestId,
      amount,
      transId,
      lang,
      description,
      signature,
    };

    console.log("====================================");
    console.log(requestBody);
    console.log("====================================");

    const URL = `${env.MOMO_URL}/v2/gateway/api/refund`;

    const responseAxios = await axios.post(URL, requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
      },
    });

    console.log("====================================");
    console.log(responseAxios.data);
    console.log("====================================");
  };

  static checkStatusTrans = async (orderId: string) => {
    const partnerCode = "MOMO";
    const requestId = orderId;
    const lang = "vi";

    const rawSignature =
      "accessKey=" +
      accessKey +
      "&orderId=" +
      orderId +
      "&partnerCode=" +
      partnerCode +
      "&requestId=" +
      requestId;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const requestBody = {
      partnerCode,
      orderId,
      requestId,
      lang,
      signature,
    };

    const URL = `${env.MOMO_URL}/v2/gateway/api/query`;

    try {
      console.log(`pending checkStatusTrans`);

      const responseAxios = await axios.post(URL, requestBody, {
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
        },
      });

      console.log(`success checkStatusTrans`);

      const response: CollectionLinkResponse & { extraData: string } = responseAxios.data;

      console.log(`response`, response);

      return response;
    } catch (error) {
      console.log(`error`, error);
    }
  };

  static confirmPayment = async (orderId: string) => {
    try {
      console.log(`fetch confirmPayment pending`);

      const response = await MomoService.checkStatusTrans(orderId);

      if (response && response.resultCode === 1000) {
        const partnerCode = "MOMO";
        const requestId = response.orderId;
        const lang = "vi";
        const requestType = "capture";
        const amount = response.amount;
        const description = "capture";

        console.log(`decodeBase64`, decodeBase64(response.extraData));

        // accessKey=$accessKey&amount=$amount&description=$description&orderId=$orderId&partnerCode=$partnerCode&requestId=$requestId&requestType=$requestType

        const rawSignature =
          "accessKey=" +
          accessKey +
          "&amount=" +
          amount +
          "&description=" +
          description +
          "&orderId=" +
          orderId +
          "&partnerCode=" +
          partnerCode +
          "&requestId=" +
          requestId +
          "&requestType=" +
          requestType;

        const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        const requestBody = {
          partnerCode,
          requestId,
          orderId,
          requestType,
          amount,
          description,
          lang,
          signature,
        };

        const URL = `${env.MOMO_URL}/v2/gateway/api/confirm`;

        const responseAxios = await axios.post(URL, requestBody, {
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(JSON.stringify(requestBody)),
          },
        });

        console.log(`fetch confirm success`);

        const confirmResponse: CollectionLinkResponse = responseAxios.data;

        console.log(`response  confirmResponse`, confirmResponse);

        return confirmResponse;
      }
    } catch (error: any) {
      console.log(`error`, error?.response?.data);
    }
  };
}

export default MomoService;
