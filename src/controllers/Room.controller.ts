import {
  ChangeRoomInput,
  CheckInInput,
  CheckoutInput,
  DiscountRoomCreateInput,
  GetChangeRoomsQuery,
  GetFrontDeskQuery,
  GetInfoInProgressParams,
  GuestStayInformationInputCreate,
  RoomInputCreate,
  RoomInputUpdate,
  SearchingRoomAvailableInput,
} from "@/schema";
import { RoomService } from "@/services";
import { GetCustomerBookedPayload } from "@/services/Room.service";
import { BadRequestError, CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";
import { CommonRequest } from "types";

class RoomController {
  create = async (req: CommonRequest<{}, {}, RoomInputCreate>, res: Response) => {
    const photo_publish = req.imageId as string;
    const response = await RoomService.create({
      ...req.body,
      beds: JSON.parse(req.body.beds),
      room_numbers: JSON.parse(req.body.room_numbers),
      photo_publish,
    });
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  addDiscount = async (req: Request<{}, {}, DiscountRoomCreateInput>, res: Response) => {
    const response = await RoomService.addDiscount(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await RoomService.getAll(filters, options);
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

  getForFrontDesk = async (req: Request<{}, {}, {}>, res: Response) => {
    const response = await RoomService.getForFrontDesk();
    return new OKResponse({
      message: "Lấy danh sách dữ liệu lễ tân thành công.",
      metadata: response,
      options: req.query,
    }).send(res);
  };

  getInfoInProgress = async (req: Request<GetInfoInProgressParams, {}, {}>, res: Response) => {
    const response = await RoomService.getInfoInProgress(req.params.bookingDetailsId);
    return new OKResponse({
      message: "Lấy dữ liệu chi tiết thành công.",
      metadata: response,
      options: req.params,
    }).send(res);
  };

  getForFrontDeskTimeline = async (req: Request<{}, {}, {}, GetFrontDeskQuery>, res: Response) => {
    const response = await RoomService.getForFrontDeskTimeline(req.query);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu timeline lễ tân thành công.",
      metadata: response,
      options: req.query,
    }).send(res);
  };

  getById = async (req: Request<RoomInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoomService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getListPrices = async (req: Request<RoomInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoomService.getListPrices(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<RoomInputUpdate["params"], {}, RoomInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const photo_publish = req.imageId as string;

    const response = await RoomService.update(
      {
        ...req.body,
        beds: JSON.parse(req.body.beds),
        room_numbers: JSON.parse(req.body.room_numbers),
        photo_publish,
      },
      +id
    );
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  searchingAvailable = async (
    req: CommonRequest<{}, {}, SearchingRoomAvailableInput>,
    res: Response
  ) => {
    const response = await RoomService.searchingRoomAvailable(req.body);
    return new OKResponse({
      message: `Tìm kiếm phòng trống thành công`,
      metadata: response,
    }).send(res);
  };

  addGuestStayInformation = async (
    req: CommonRequest<{}, {}, GuestStayInformationInputCreate>,
    res: Response
  ) => {
    const response = await RoomService.addGuestStayInformation(req.body);
    return new OKResponse({
      message: `Thêm thông tin khách lưu trú thành công`,
      metadata: response,
    }).send(res);
  };

  searchingAvailableDesktop = async (
    req: CommonRequest<{}, {}, Omit<SearchingRoomAvailableInput, "room_id">>,
    res: Response
  ) => {
    const response = await RoomService.searchingRoomAvailableDesktop(req.body);
    return new OKResponse({
      message: `Tìm kiếm phòng trống thành công`,
      metadata: response,
    }).send(res);
  };

  checkInRooms = async (req: CommonRequest<{}, {}, CheckInInput>, res: Response) => {
    const response = await RoomService.checkIn(req.body);
    return new OKResponse({
      message: `Check-in thành công`,
      metadata: response,
    }).send(res);
  };

  getChangeRooms = async (req: CommonRequest<{}, {}, {}, GetChangeRoomsQuery>, res: Response) => {
    const response = await RoomService.getChangeRooms(req.query);
    return new OKResponse({
      message: `Lấy danh sách phòng có sẵn thành công`,
      metadata: response,
    }).send(res);
  };

  changeRoom = async (req: CommonRequest<{}, {}, ChangeRoomInput>, res: Response) => {
    const response = await RoomService.changeRoom(req.body);
    return new OKResponse({
      message: `Thay đổi phòng thành công`,
      metadata: response,
    }).send(res);
  };

  getCustomerByRoomNumber = async (
    req: CommonRequest<{}, {}, {}, GetCustomerBookedPayload>,
    res: Response
  ) => {
    if (
      !req.query.checkIn ||
      !req.query.checkOut ||
      !req.query.modeBooking ||
      !req.query.roomNumber
    ) {
      throw new BadRequestError(`Thiếu dữ liệu`);
    }

    const response = await RoomService.getCustomerByRoomNumber(req.query);

    return new OKResponse({
      message: `Tìm kiếm phòng trống thành công`,
      metadata: response,
    }).send(res);
  };

  getInformationRoomByBookingDetailsId = async (
    req: CommonRequest<{ bookingDetailId: string }, {}, {}>,
    res: Response
  ) => {
    const response = await RoomService.getInformationRoomByBookingDetailsId(
      req.params.bookingDetailId
    );

    return new OKResponse({
      message: `Lấy thông tin chi tiết thành công`,
      metadata: response,
    }).send(res);
  };

  checkout = async (req: CommonRequest<{}, {}, CheckoutInput>, res: Response) => {
    const response = await RoomService.checkout(req.body);

    return new OKResponse({
      message: `Trả phòng thành công`,
      metadata: response,
    }).send(res);
  };

  cleanupRoom = async (
    req: CommonRequest<{ bookingDetailId: string }, {}, CheckoutInput>,
    res: Response
  ) => {
    const response = await RoomService.cleanupRoom(req.params.bookingDetailId);

    return new OKResponse({
      message: `Dọn phòng thành công`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<RoomInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoomService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new RoomController();
