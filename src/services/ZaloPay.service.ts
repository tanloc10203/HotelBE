import { SocketEventsName, configZaloPay } from "@/constants";
import { CryptoHelper, ExpoServerSDK, NetworkHelper } from "@/helpers";
import { ServiceIO } from "@/helpers/socket.io.helper";
import { Transaction } from "@/lib";
import {
  Bill,
  BillModel,
  Booking,
  BookingDetail,
  BookingDetailModel,
  BookingModel,
  Notification,
  NotificationModel,
  NotificationTypes,
  RefundZaloPayPayload,
  RequestPaymentPayload,
  ResponseCreateState,
  ResponsePayment,
  ResponseQueryStatusState,
  ResponseRefundState,
  ZaloPayTransaction,
  ZaloPayTransactionModel,
} from "@/models";
import { NotFoundRequestError } from "@/utils";
import axios from "axios";
import moment from "moment";
import qs from "qs";
import BookingService from "./Booking.service";
import BookingDetailService from "./BookingDetail.service";
import SaveExpoPushTokenService from "./SaveExpoPushToken.service";
import ZaloPayTransactionService from "./ZaloPayTransaction.service";
import CronService from "./Cron.service";

class ZaloPayService {
  public static generateTransId = () => Math.floor(Math.random() * 1000000);

  public static generateAppTransId = (transId: number) => `${moment().format("YYMMDD")}_${transId}`;

  public static appTime = () => Date.now();

  public static requestPayment = async (payload: RequestPaymentPayload) => {
    const network = new NetworkHelper();
    const mobileURL = network.mobileURL("success");
    const serverURL = network.serverURL("response-payment");
    const { amount, appUser, description, title, extraData } = payload;

    const transID = ZaloPayService.generateTransId();
    const appTransId = ZaloPayService.generateAppTransId(transID);
    const appTime = ZaloPayService.appTime();

    // columninfo: { ...extraData }

    const embed_data = { redirecturl: mobileURL };
    const items = [{}];
    const bankCode = configZaloPay.bankCode.appToApp;

    const order = {
      app_id: configZaloPay.appId,
      app_trans_id: appTransId,
      app_user: appUser,
      app_time: appTime,
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: amount,
      description: `${description} #${transID}`,
      bank_code: configZaloPay.bankCode.qr,
      callback_url: serverURL,
      title,
    };

    console.log("====================================");
    console.log(`order`, order);
    console.log("====================================");

    const data =
      order.app_id +
      "|" +
      order.app_trans_id +
      "|" +
      order.app_user +
      "|" +
      order.amount +
      "|" +
      order.app_time +
      "|" +
      order.embed_data +
      "|" +
      order.item;

    const mac = CryptoHelper.hmac(configZaloPay.key1, data);

    console.log("====================================");
    console.log(`mac -->`, mac);
    console.log("====================================");

    try {
      const URL = configZaloPay.endpoint + "/create";

      const responseAxios = await axios.post(URL, null, {
        params: { ...order, mac },
      });

      const data = responseAxios.data as ResponseCreateState;

      if (data.return_code === 1) {
        if (payload.bookingId) {
          const { bookingId } = payload;
          await ZaloPayTransactionService.create({
            app_id: +order.app_id,
            app_trans_id: order.app_trans_id,
            app_user: bookingId,
            description,
            embed_data: JSON.stringify(embed_data),
            item: JSON.stringify(items),
            mac,
            bank_code: bankCode,
            booking_id: bookingId,
            id: `${transID}`,
            order_token: data.order_token,
            zp_trans_token: data.zp_trans_token,
            title: title,
            app_time: appTime,
            amount: order.amount,
            is_booking: payload.isBooking,
          });
        }

        if (payload.bookingDetailsId) {
          const { bookingDetailsId } = payload;
          await ZaloPayTransactionService.create({
            app_id: +order.app_id,
            app_trans_id: order.app_trans_id,
            app_user: bookingDetailsId,
            description,
            embed_data: JSON.stringify(embed_data),
            item: JSON.stringify(items),
            mac,
            bank_code: bankCode,
            booking_id: bookingDetailsId,
            id: `${transID}`,
            order_token: data.order_token,
            zp_trans_token: data.zp_trans_token,
            title: title,
            app_time: appTime,
            amount: order.amount,
            is_booking: payload.isBooking,
          });
        }

        if (!payload.bookingDetailsId && !payload.bookingId) {
          await ZaloPayTransactionService.create({
            app_id: +order.app_id,
            app_trans_id: order.app_trans_id,
            app_user: appUser,
            description,
            embed_data: JSON.stringify(embed_data),
            item: JSON.stringify(items),
            mac,
            bank_code: bankCode,
            id: `${transID}`,
            order_token: data.order_token,
            zp_trans_token: data.zp_trans_token,
            title: title,
            app_time: appTime,
            amount: order.amount,
          });
        }
      }

      console.log("====================================");
      console.log(`response`, data);
      console.log("====================================");

      return data.order_url;
    } catch (error) {
      console.log("====================================");
      console.log(`error`, error);
      console.log("====================================");
    }
  };

  public static queryStatus = async (transId: string) => {
    const postData = {
      app_id: configZaloPay.appId,
      app_trans_id: transId,
    };

    const rawData = postData.app_id + "|" + postData.app_trans_id + "|" + configZaloPay.key1;

    const mac = CryptoHelper.hmac(configZaloPay.key1, rawData);

    try {
      const URL = `${configZaloPay.endpoint}/query`;

      const responseAxios = await axios.post(URL, qs.stringify({ ...postData, mac }), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const response = responseAxios.data as ResponseQueryStatusState;

      return response;
    } catch (error) {
      console.log("====================================");
      console.log(`error queryStatus`, error);
      console.log("====================================");
    }
  };

  public static refund = async ({ amount, zpTransId, description }: RefundZaloPayPayload) => {
    const timestamp = Date.now();
    const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`; // unique id

    const params = {
      app_id: configZaloPay.appId,
      m_refund_id: `${moment().format("YYMMDD")}_${configZaloPay.appId}_${uid}`,
      timestamp,
      zp_trans_id: zpTransId,
      amount: `${amount}`,
      description: description,
    };

    const rawData =
      params.app_id +
      "|" +
      params.zp_trans_id +
      "|" +
      params.amount +
      "|" +
      params.description +
      "|" +
      params.timestamp;

    const mac = CryptoHelper.hmac(configZaloPay.key1, rawData);
    console.log("====================================");
    console.log(`{ ...params, mac } = `, { ...params, mac });
    console.log("====================================");

    const URL = `${configZaloPay.endpoint}/refund`;

    console.log("====================================");
    console.log(`url`, URL);
    console.log("====================================");

    try {
      const responseAxios = await axios.post(URL, null, { params: { ...params, mac } });

      const response = responseAxios.data as ResponseRefundState;

      console.log("====================================");
      console.log(`response refund`, response);
      console.log("====================================");
    } catch (error: any) {
      console.log("====================================");
      console.log(`error refund`, error);
      console.log("====================================");
    }
  };

  public static callback = async (payload: ResponsePayment, socket: ServiceIO) => {
    const [zaloPayTransaction, queryStatus] = await Promise.all([
      ZaloPayTransactionService.findOne({
        app_trans_id: payload.apptransid,
      }),
      ZaloPayService.queryStatus(payload.apptransid),
    ]);

    if (!zaloPayTransaction) {
      throw new NotFoundRequestError(`Giao dịch không tồn tại`);
    }

    // if (payload.checksum !== zaloPayTransaction.mac) {
    //   throw new BadRequestError(`Tham số chữ kí không hợp lệ`);
    // }

    const transaction = new Transaction();
    const connection = await transaction.getPoolTransaction();

    try {
      if (zaloPayTransaction.booking_id) {
        const { booking_id } = zaloPayTransaction;

        const [{ results }, booking] = await Promise.all([
          BookingDetailService.getAll({ booking_id: booking_id }, {}),
          BookingService.getById(booking_id),
        ]);

        const saveTokenExpo = await SaveExpoPushTokenService.findOne({
          actor_type: "customer",
          user_id: booking.customer_id,
        });

        if (payload.status === 1 && queryStatus?.return_code === 1) {
          await Promise.all([
            ...results.map(
              (row) =>
                new Promise(async (resolve, reject) => {
                  try {
                    await transaction.update<Partial<Bill>, Bill>({
                      data: { status: "paid", cost_room_paid: row.bill?.total_price },
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
            ),
            transaction.update<Partial<BookingDetail>, BookingDetail>({
              data: { status: "pending_confirmation" },
              key: "booking_id",
              pool: connection,
              table: BookingDetailModel.getTable,
              valueOfKey: booking_id,
            }),
          ]);

          const body = zaloPayTransaction.is_booking
            ? `Bạn đã đặt phòng thành công. Mã đặt phòng là ${booking.id}`
            : `Bạn đã thanh toán đặt phòng thành công. Mã đặt phòng là ${booking.id}`;

          const title = zaloPayTransaction.is_booking
            ? "Đặt phòng thành công"
            : "Thanh toán thành công";

          // 9.
          const notificationInsert: Notification = {
            actor_type: "customer",
            body: body,
            entity_id: booking_id,
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

          if (!zaloPayTransaction.is_booking) {
            await transaction.update<Partial<Booking>, Booking>({
              data: { status: "pending_confirmation" },
              key: "id",
              pool: connection,
              table: BookingModel.getTable,
              valueOfKey: booking.id!,
            });
          }

          socket
            .to(`${booking.customer_id}`)
            .emit(SocketEventsName.NOTIFICATION, notificationInsert);

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
      }

      await transaction.update<Partial<ZaloPayTransaction>, ZaloPayTransaction>({
        data: {
          status:
            payload.status === 1 || queryStatus?.return_code === 1 ? "successfully" : "failed",
          zp_trans_id: queryStatus?.zp_trans_id,
          sub_return_code: queryStatus?.sub_return_code,
          sub_return_message: queryStatus?.sub_return_message,
          return_code: queryStatus?.return_code,
          return_message: queryStatus?.return_message,
        },
        key: "id",
        pool: connection,
        table: ZaloPayTransactionModel.getTable,
        valueOfKey: zaloPayTransaction.id!,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      await connection.commit();
      connection.release();
      transaction.releaseConnection(connection);
    }

    if (zaloPayTransaction.booking_id) {
      if (payload.status === 1) {
        CronService.confirmBooking(zaloPayTransaction.booking_id!, socket);
      } else {
        CronService.deleteBookingAfter3Hour(zaloPayTransaction.booking_id, socket);
      }
    }
  };
}

export default ZaloPayService;
