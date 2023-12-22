import { OwnerInputCreate, OwnerInputUpdate } from "@/schema";
import { OwnerService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class OwnerController {
  create = async (req: Request<{}, {}, OwnerInputCreate>, res: Response) => {
    // const response = await OwnerService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: "" },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await OwnerService.getAll(filters);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };

  getById = async (req: Request<OwnerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await OwnerService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<OwnerInputUpdate["params"], {}, OwnerInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await OwnerService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<OwnerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await OwnerService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new OwnerController();
