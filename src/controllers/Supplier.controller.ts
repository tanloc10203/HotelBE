import { SupplierInputCreate, SupplierInputUpdate } from "@/schema";
import { SupplierService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class SupplierController {
  create = async (req: Request<{}, {}, SupplierInputCreate>, res: Response) => {
    const response = await SupplierService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await SupplierService.getAll(filters, options);
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

  getById = async (req: Request<SupplierInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await SupplierService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<SupplierInputUpdate["params"], {}, SupplierInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await SupplierService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<SupplierInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await SupplierService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new SupplierController();
