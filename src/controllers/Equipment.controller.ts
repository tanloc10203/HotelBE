import { Group } from "@/models";
import { EquipmentInputCreate, EquipmentInputUpdate } from "@/schema";
import { EquipmentService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class EquipmentController {
  create = async (req: Request<{}, {}, EquipmentInputCreate>, res: Response) => {
    const response = await EquipmentService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await EquipmentService.getAll(filters, options);
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

  getGroups = async (req: Request<{}, {}, {}>, res: Response) => {
    const response = EquipmentService.getGroups();
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getByGroup = async (req: Request<{}, {}, {}, { group: Group }>, res: Response) => {
    const response = await EquipmentService.getFilterByGroup(req.query.group);
    return new OKResponse({
      message: "Lấy danh sách dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getById = async (req: Request<EquipmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EquipmentService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<EquipmentInputUpdate["params"], {}, EquipmentInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await EquipmentService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<EquipmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EquipmentService.deleteById(+id);
    return new OKResponse({
      message: `Chuyển dữ liệu theo id = ${id} vào thùng rác thành công.`,
      metadata: response,
    }).send(res);
  };

  restore = async (req: Request<EquipmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EquipmentService.restore(+id);
    return new OKResponse({
      message: `Khôi phục dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  truncateTrash = async (req: Request<EquipmentInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await EquipmentService.truncateTrash(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new EquipmentController();
