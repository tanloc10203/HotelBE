import {
  PriceListInputCreate,
  PriceListInputCreateDiscount,
  PriceListInputUpdate,
  PriceListInputUpdateDiscount,
} from "@/schema";
import { PriceListService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class PriceListController {
  create = async (req: Request<{}, {}, PriceListInputCreate>, res: Response) => {
    const response = await PriceListService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  createDiscount = async (req: Request<{}, {}, PriceListInputCreateDiscount>, res: Response) => {
    const response = await PriceListService.createDiscount(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await PriceListService.getAll(filters, options);
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

  getById = async (req: Request<PriceListInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PriceListService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<PriceListInputUpdate["params"], {}, PriceListInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await PriceListService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  updateDiscount = async (
    req: Request<PriceListInputUpdateDiscount["params"], {}, PriceListInputUpdateDiscount["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await PriceListService.updateDiscount(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<PriceListInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PriceListService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new PriceListController();
