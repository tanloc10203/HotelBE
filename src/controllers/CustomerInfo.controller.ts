import { CustomerInfoInputCreate, CustomerInfoInputUpdate } from "@/schema";
import { CustomerInfoService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class CustomerInfoController {
  create = async (req: Request<{}, {}, CustomerInfoInputCreate>, res: Response) => {
    // const response = await CustomerInfoService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: "" },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const filters = req.query;
    const response = await CustomerInfoService.getAll(filters);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
      options: filters,
    }).send(res);
  };

  getById = async (req: Request<CustomerInfoInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await CustomerInfoService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<CustomerInfoInputUpdate["params"], {}, CustomerInfoInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    // const response = await CustomerInfoService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: {},
    }).send(res);
  };

  delete = async (req: Request<CustomerInfoInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await CustomerInfoService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new CustomerInfoController();
