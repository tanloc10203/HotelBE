import { SocketEventsName } from "@/constants";
import { ExpoServerSDK, NetworkHelper } from "@/helpers";
import { ServiceIO } from "@/helpers/socket.io.helper";
import { Transaction } from "@/lib";
import {
  Bill,
  BillModel,
  Booking,
  BookingModel,
  MomoPaymentResponse,
  MomoTransaction,
  MomoTransactionModel,
  Notification,
  NotificationModel,
  NotificationTypes,
  ResponsePayment,
} from "@/models";
import { decodeBase64 } from "@/utils";
import { env } from "config";
import crypto from "node:crypto";
import { Socket } from "socket.io";
import { SessionSocket } from "types/global";
import BookingService from "./Booking.service";
import BookingDetailService from "./BookingDetail.service";
import CronService from "./Cron.service";
import MomoTransactionService from "./MomoTransaction.service";
import SaveExpoPushTokenService from "./SaveExpoPushToken.service";
import ZaloPayService from "./ZaloPay.service";

const accessKey = env.MOMO_ACCESS_KEY;
const secretKey = env.MOMO_SECRET_KEY;
// const ipnUrl = "https://endcool-api.onrender.com/response-momo";

export type SavePushTokenExpoPayload = {
  expoPushToken: string;
  userId: number;
};

class SocketService {
  public joinServer(socket: SessionSocket) {
    if (socket.userId) {
      socket.join(`${socket.userId}`);
    }
  }

  public async savePushTokenExpo(
    { expoPushToken, userId }: SavePushTokenExpoPayload,
    socket: Socket
  ) {
    const expo = new ExpoServerSDK();

    if (!expo.isExpoPushToken(expoPushToken)) return;

    const expoExists = await SaveExpoPushTokenService.findOne({ user_id: userId });

    if (!expoExists) {
      await SaveExpoPushTokenService.create({
        actor_type: "customer",
        expo_push_token: expoPushToken,
        user_id: userId,
      });
    } else {
      if (expoExists.expo_push_token !== expoPushToken)
        await SaveExpoPushTokenService.update({ expo_push_token: expoPushToken }, expoExists.id!);
    }
  }

  public getCountNotification = async (socket: ServiceIO, customerId: number) => {
    const response = await NotificationModel.count({
      actor_type: "customer",
      user_id: customerId,
      is_read: 0,
    });

    socket.in(`${customerId}`).emit(SocketEventsName.GET_COUNT_NOTIFICATION, response);
  };

  public responsePayment = async (response: MomoPaymentResponse, socket: ServiceIO) => {
    console.log(`response payment`, response);

    const network = new NetworkHelper();
    const host = network.getLanHost();

    const ipnUrl = `http://localhost:${env.APP_PORT}/api/v1/response-payment`;
    const redirectUrl = `exp://${host}:8081/--/success`;
    // const requestType = "captureWallet";
    const requestType = "payWithMethod";

    const rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      response.amount +
      "&extraData=" +
      response.extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      response.orderId +
      "&orderInfo=" +
      response.orderInfo +
      "&partnerCode=" +
      response.partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      response.requestId +
      "&requestType=" +
      requestType;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const trans = await MomoTransactionService.findOne({ id: response.orderId });

    if (!trans) return;

    if (trans.signature !== signature) {
      return;
    }

    if (!trans.booking_id) return;

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    const [{ results }, booking] = await Promise.all([
      BookingDetailService.getAll({ booking_id: trans.booking_id }, {}),
      BookingService.getById(trans.booking_id),
    ]);

    const saveTokenExpo = await SaveExpoPushTokenService.findOne({
      actor_type: "customer",
      user_id: booking.customer_id,
    });

    try {
      if (response.resultCode === 0) {
        await Promise.all(
          results.map(
            (row) =>
              new Promise(async (resolve, reject) => {
                try {
                  await transaction.update<Partial<Bill>, Bill>({
                    data: { status: "paid" },
                    key: "booking_details_id",
                    pool: connection,
                    table: BillModel.getTable,
                    valueOfKey: row.id,
                  });

                  resolve(true);
                } catch (error) {
                  reject(error);
                }
              })
          )
        );

        let type = "booking";

        if (response.extraData) {
          type = JSON.parse(decodeBase64(response.extraData))?.type;
        }

        const body =
          type === "booking"
            ? `Bạn đã đặt phòng thành công. Mã đặt phòng là ${booking.id}`
            : `Bạn đã thanh toán đặt phòng thành công. Mã đặt phòng là ${booking.id}`;

        const title = type === "booking" ? "Đặt phòng thành công" : "Thanh toán thành công";

        // 9.
        const notificationInsert: Notification = {
          actor_type: "customer",
          body: body,
          entity_id: trans.booking_id,
          entity_name: BookingModel.getTable,
          title: title,
          user_id: booking.customer_id,
          notification_type: NotificationTypes.CUSTOMER_BOOKING_SUCCESS,
        };

        await transaction.create<Notification>({
          data: notificationInsert,
          pool: connection,
          table: NotificationModel.getTable,
        });

        if (type === "payment") {
          await transaction.update<Partial<Booking>, Booking>({
            data: { status: "pending_confirmation" },
            key: "id",
            pool: connection,
            table: BookingModel.getTable,
            valueOfKey: booking.id!,
          });
        }

        socket.to(`${booking.customer_id}`).emit(SocketEventsName.NOTIFICATION, notificationInsert);

        if (saveTokenExpo) {
          const expo = new ExpoServerSDK();
          await expo.pushToken({
            to: saveTokenExpo.expo_push_token!,
            body: notificationInsert.body,
            title: notificationInsert.title,
            sound: "default",
          });
        }
      } else {
        await transaction.update<Partial<Booking>, Booking>({
          data: { status: "pending_payment" },
          key: "id",
          pool: connection,
          table: BookingModel.getTable,
          valueOfKey: booking.id!,
        });
      }

      await transaction.update<Partial<MomoTransaction>, MomoTransaction>({
        data: {
          status: response.resultCode !== 0 ? "failed" : "successfully",
          message: response.message,
          trans_id: response.transId,
          pay_type: response.resultCode !== 0 ? null : response.payType,
          partner_user_Id: response.partnerUserId,
          order_type: response.orderType,
          result_code: `${response.resultCode}`,
        },
        key: "id",
        pool: connection,
        table: MomoTransactionModel.getTable,
        valueOfKey: response.orderId,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    if (response.resultCode === 0) {
      CronService.confirmBooking(booking.id!, socket);
    } else {
      CronService.deleteBookingAfter3Hour(booking.id!, socket);
    }
  };

  public responsePaymentZaloPay = async (response: ResponsePayment, socket: ServiceIO) => {
    console.log("====================================");
    console.log(`response payment zalo pay`, response);
    console.log("====================================");

    const responseCallback = await ZaloPayService.callback(response, socket);
  };
}

export default SocketService;
