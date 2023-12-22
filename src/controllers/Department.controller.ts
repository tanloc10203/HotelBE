import { DepartmentInputCreate, DepartmentInputUpdate } from "@/schema";
import { DepartmentService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class DepartmentController {
  create = async (req: Request<{}, {}, DepartmentInputCreate>, res: Response) => {
    const response = await DepartmentService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await DepartmentService.getAll(filters);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };

  getById = async (req: Request<DepartmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await DepartmentService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<DepartmentInputUpdate["params"], {}, DepartmentInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await DepartmentService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<DepartmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await DepartmentService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new DepartmentController();
