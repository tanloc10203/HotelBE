import { RoleEmployeeInputCreate, RoleEmployeeInputUpdate } from "@/schema";
import { RoleEmployeeService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class RoleEmployeeController {
  create = async (req: Request<{}, {}, RoleEmployeeInputCreate>, res: Response) => {
    const response = await RoleEmployeeService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await RoleEmployeeService.getAll(filters);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };

  getById = async (req: Request<RoleEmployeeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoleEmployeeService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<RoleEmployeeInputUpdate["params"], {}, RoleEmployeeInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await RoleEmployeeService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<RoleEmployeeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoleEmployeeService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new RoleEmployeeController();
