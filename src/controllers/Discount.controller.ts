import { DiscountInputCreate, DiscountInputUpdate } from "@/schema";
import { DiscountService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class DiscountController {
  create = async (req: Request<{}, {}, DiscountInputCreate>, res: Response) => {
    const response = await DiscountService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await DiscountService.getAll(filters, options);
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

  getById = async (req: Request<DiscountInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await DiscountService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getByRoomId = async (req: Request<{ roomId: string }, {}, {}>, res: Response) => {
    const id = req.params.roomId;
    const response = await DiscountService.getByRoomId(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<DiscountInputUpdate["params"], {}, DiscountInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await DiscountService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<DiscountInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await DiscountService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new DiscountController();
