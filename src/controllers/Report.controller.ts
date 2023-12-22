import { MoneyServiceQuery, RateBookingQuery } from "@/schema";
import { ReportService } from "@/services";
import { OKResponse } from "@/utils";
import { Request, Response } from "express";

class ReportController {
  rateBooking = async (req: Request<{}, {}, {}, RateBookingQuery>, res: Response) => {
    const filters = req.query;
    const response = await ReportService.rateBooking(filters);
    return new OKResponse({
      message: "Lấy tỉ lệ đặt phòng thành công",
      metadata: response,
      options: filters,
    }).send(res);
  };

  quantityBooking = async (req: Request<{}, {}, {}, RateBookingQuery>, res: Response) => {
    const filters = req.query;
    const response = await ReportService.quantityBooking(filters);
    return new OKResponse({
      message: "Số lượng đặt phòng thành công",
      metadata: response,
      options: filters,
    }).send(res);
  };

  moneyRoomType = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await ReportService.moneyRoomType(filters);
    return new OKResponse({
      message: "Báo cáo danh thu theo phòng",
      metadata: response,
      options: filters,
    }).send(res);
  };

  serviceMoney = async (req: Request<{}, {}, {}, RateBookingQuery>, res: Response) => {
    const filters = req.query;
    const response = await ReportService.moneyService(filters);
    return new OKResponse({
      message: "Báo cáo danh thu dịch vụ / hàng hóa",
      metadata: response,
      options: filters,
    }).send(res);
  };
}

export default new ReportController();
