import { ZaloPayTransactionInputCreate, ZaloPayTransactionInputUpdate } from "@/schema";
import { ZaloPayTransactionService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class ZaloPayTransactionController {
  create = async (req: Request<{}, {}, ZaloPayTransactionInputCreate>, res: Response) => {
    // const response = await ZaloPayTransactionService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: 1 },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await ZaloPayTransactionService.getAll(filters, options);
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

  getById = async (
    req: Request<ZaloPayTransactionInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await ZaloPayTransactionService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<
      ZaloPayTransactionInputUpdate["params"],
      {},
      ZaloPayTransactionInputUpdate["body"]
    >,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await ZaloPayTransactionService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<ZaloPayTransactionInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ZaloPayTransactionService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new ZaloPayTransactionController();
