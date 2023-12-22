import { PositionInputCreate, PositionInputUpdate } from "@/schema";
import { PositionService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class PositionController {
  create = async (req: Request<{}, {}, PositionInputCreate>, res: Response) => {
    const response = await PositionService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await PositionService.getAll(filters);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };

  getById = async (req: Request<PositionInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PositionService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<PositionInputUpdate["params"], {}, PositionInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await PositionService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<PositionInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await PositionService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new PositionController();
