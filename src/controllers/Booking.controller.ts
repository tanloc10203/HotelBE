import SocketIOServer from "@/helpers/socket.io.helper";
import {
  BookingDeskTopInput,
  BookingInputCreate,
  BookingInputUpdate,
  GetBookingByCustomerQuery,
  GetBookingDetailsQuery,
  PaymentBookingInput,
} from "@/schema";
import { BookingService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class BookingController {
  create = async (req: Request<{}, {}, BookingInputCreate>, res: Response) => {
    const socketIO = SocketIOServer.getSocketServer(req);

    const response = await BookingService.create(req.body, socketIO);
    return new CreatedResponse({
      message: "Đặt phòng thành công",
      metadata: response,
    }).send(res);
  };

  bookingDesktop = async (req: Request<{}, {}, BookingDeskTopInput>, res: Response) => {
    const socketIO = SocketIOServer.getSocketServer(req);

    const response = await BookingService.bookingDesktop(req.body);

    return new CreatedResponse({
      message: "Đặt phòng thành công",
      metadata: response,
    }).send(res);
  };

  receiveRoomDesktop = async (req: Request<{}, {}, BookingDeskTopInput>, res: Response) => {
    const socketIO = SocketIOServer.getSocketServer(req);

    const response = await BookingService.receiveRoomDesktop(req.body);

    return new CreatedResponse({
      message: "Nhận phòng thành công",
      metadata: response,
    }).send(res);
  };

  paymentBooking = async (req: Request<{}, {}, PaymentBookingInput>, res: Response) => {
    const response = await BookingService.paymentBooking(req.body.bookingId);

    return new CreatedResponse({
      message: "Lấy url thanh toán thành công",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await BookingService.getAll(filters, options);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response.results,
      options: {
        limit: options.limit,
        page: options.page,
        totalRows: response.total,
        totalPage: Math.ceil(response.total / options.limit),
      },
    }).send(res);
  };

  getById = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getBookingByCustomer = async (
    req: Request<{}, {}, {}, GetBookingByCustomerQuery>,
    res: Response
  ) => {
    const response = await BookingService.getBookingByCustomer(Number(req.query.customerId));
    return new OKResponse({
      message: `Lấy dữ liệu theo khách hàng = ${req.query.customerId} thành công.`,
      metadata: response,
    }).send(res);
  };

  getBookingDetails = async (req: Request<{}, {}, {}, GetBookingDetailsQuery>, res: Response) => {
    const response = await BookingService.getBookingDetails(req.query.bookingId);
    return new OKResponse({
      message: `Lấy dữ liệu chi tiết theo mã đặt phòng = ${req.query.bookingId} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<BookingInputUpdate["params"], {}, BookingInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await BookingService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  cancelBooking = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.cancelBooking(id);
    return new OKResponse({
      message: `Hủy phòng thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  paymentFailed = async (req: Request<BookingInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BookingService.paymentFailed(id);
    return new OKResponse({
      message: `Cập nhật dữ liệu paymentFailed theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new BookingController();
