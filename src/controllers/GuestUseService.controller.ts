import {
  GuestPlusMinusInput,
  GuestUseServiceInputCreate,
  GuestUseServiceInputUpdate,
} from "@/schema";
import { GuestUseServiceService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class GuestUseServiceController {
  create = async (req: Request<{}, {}, GuestUseServiceInputCreate>, res: Response) => {
    const response = await GuestUseServiceService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  plusMinus = async (
    req: Request<GuestPlusMinusInput["params"], {}, GuestPlusMinusInput["body"]>,
    res: Response
  ) => {
    const response = await GuestUseServiceService.plusMinus(req.body, req.params.id);
    return new CreatedResponse({
      message: "Thay đổi số lượng thành công",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await GuestUseServiceService.getAll(filters, options);
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

  getById = async (req: Request<GuestUseServiceInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await GuestUseServiceService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<GuestUseServiceInputUpdate["params"], {}, GuestUseServiceInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await GuestUseServiceService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<GuestUseServiceInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await GuestUseServiceService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new GuestUseServiceController();
