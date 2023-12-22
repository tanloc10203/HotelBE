import { EmployeeInputCreate, EmployeeInputUpdate } from "@/schema";
import { EmployeeService, RoleEmployeeService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";
import { CommonRequest } from "types";

class EmployeeController {
  create = async (req: Request<{}, {}, EmployeeInputCreate>, res: Response) => {
    const response = await EmployeeService.add(req.body, req.ip);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (
    req: Request<{}, {}, {}, { page?: string; limit?: string; order?: string }>,
    res: Response
  ) => {
    const { filters, options } = handleFilterQuery(req);

    const response = await EmployeeService.getAll(filters, options);

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

  getById = async (req: Request<EmployeeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EmployeeService.getByIdV2(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  getPermissions = async (req: CommonRequest, res: Response) => {
    const id = req.userId!;
    const response = await RoleEmployeeService.getByEmployeeId(id);
    return new OKResponse({
      message: `Lấy danh sách quyền theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<EmployeeInputUpdate["params"], {}, EmployeeInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await EmployeeService.updateV2(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<EmployeeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EmployeeService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new EmployeeController();
