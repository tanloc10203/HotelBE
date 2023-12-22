import { dateFormat } from "@/utils";
import cron from "node-cron";
import type { Server } from "socket.io";
import BookingService from "./Booking.service";
import DiscountService from "./Discount.service";

class CronService {
  constructor(socketIO: Server) {
    // this.confirmBookingEvery5second(socketIO);
    // this.testCron();
    this.checkDiscountExpires();
    this.checkBookingExpires();
  }

  static confirmBooking = (bookingId: string, socketIO: Server) => {
    let isRequesting = false;

    const job = cron.schedule(
      "*/5 * * * * *",
      async () => {
        if (!isRequesting) {
          try {
            await BookingService.confirmBooking(socketIO, bookingId);
            console.log("Cron on the mic confirmBooking :)) ", dateFormat());
          } catch (error) {
            console.log(`error cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        timezone: "Asia/Ho_Chi_Minh",
      }
    );

    const timeoutId = setTimeout(() => {
      job.stop();
      clearTimeout(timeoutId);
    }, 1000 * 5.1);
  };

  static deleteBookingAfter3Hour = (bookingId: string, socketIO: Server) => {
    let isRequesting = false;

    const job = cron.schedule(
      "* * */3 * * *",
      async () => {
        if (!isRequesting) {
          try {
            await BookingService.deleteBookingAfter3Hour(socketIO, bookingId);
            console.log("Cron on the mic deleteBookingAfter3Hour :)) ", dateFormat());
          } catch (error) {
            console.log(`error  cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        timezone: "Asia/Ho_Chi_Minh",
      }
    );

    const timeout = 60 * 1000 * 60 * 3.1;

    const timeoutId = setTimeout(() => {
      job.stop();
      clearTimeout(timeoutId);
    }, timeout);
  };

  private testCron = () => {
    let isRequesting = false;

    const job = cron.schedule(
      "*/5 * * * * *",
      async () => {
        if (!isRequesting) {
          try {
            console.log("Cron on the mic testCron :)) ", dateFormat());
          } catch (error) {
            console.log(`error cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        timezone: "Asia/Ho_Chi_Minh",
      }
    );

    const timeoutId = setTimeout(() => {
      job.stop();
      clearTimeout(timeoutId);
    }, 10 * 1000);
  };

  private confirmBookingEvery5second = (socketIO: Server) => {
    let isRequesting = false;

    const job = cron.schedule(
      "*/5 * * * * *",
      async () => {
        if (!isRequesting) {
          try {
            const count = await BookingService.confirmAllBooking(socketIO);
            console.log("Cron on the mic :)) ", dateFormat());
            console.log("Cron count ", count);
          } catch (error) {
            console.log(`error  cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Ho_Chi_Minh",
        name: "confirmBookingEvery5second",
      }
    );

    job.start();
  };

  private cancelBookingOverCheckInTenHourEvery5minute = (socketIO: Server) => {
    let isRequesting = false;

    const job = cron.schedule(
      "*/5 * * * * *",
      async () => {
        if (!isRequesting) {
          try {
            const count = await BookingService.confirmAllBooking(socketIO);
            console.log("Cron on the mic :)) ", dateFormat());
            console.log("Cron count ", count);
          } catch (error) {
            console.log(`error  cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Ho_Chi_Minh",
      }
    );

    job.start();
  };

  private checkDiscountExpires = () => {
    let isRequesting = false;

    // run every 3 hours
    const job = cron.schedule(
      "* */3 * * *",
      async () => {
        if (!isRequesting) {
          try {
            await DiscountService.checkExpires();
            console.log("Cron on the mic checkDiscountExpires :)) ", dateFormat());
          } catch (error) {
            console.log(`error  cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Ho_Chi_Minh",
      }
    );

    job.start();
  };

  private checkBookingExpires = () => {
    let isRequesting = false;

    // run every 5 hours
    const job = cron.schedule(
      "* */5 * * *",
      async () => {
        if (!isRequesting) {
          try {
            await BookingService.checkExpiresCheckInOut();
            console.log("Cron on the mic checkExpiresCheckInOut :)) ", dateFormat());
          } catch (error) {
            console.log(`error  cron`, error);
          } finally {
            isRequesting = false;
          }
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Ho_Chi_Minh",
      }
    );

    job.start();
  };
}

export default CronService;
