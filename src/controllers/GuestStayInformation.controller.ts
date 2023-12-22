import { GuestStayInformationInputCreate, GuestStayInformationInputUpdate } from "@/schema";
import { GuestStayInformationService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class GuestStayInformationController {
  create = async (req: Request<{}, {}, GuestStayInformationInputCreate>, res: Response) => {
    const response = await GuestStayInformationService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await GuestStayInformationService.getAll(filters, options);
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
    req: Request<GuestStayInformationInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await GuestStayInformationService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<
      GuestStayInformationInputUpdate["params"],
      {},
      GuestStayInformationInputUpdate["body"]
    >,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await GuestStayInformationService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (
    req: Request<GuestStayInformationInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await GuestStayInformationService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new GuestStayInformationController();
