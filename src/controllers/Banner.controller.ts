import { BannerInputCreate, BannerInputUpdate } from "@/schema";
import { BannerService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";
import { CommonRequest } from "types";

class BannerController {
  create = async (req: CommonRequest<{}, {}, BannerInputCreate>, res: Response) => {
    const response = await BannerService.create(req.imageId as string[]);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await BannerService.getAll(filters, options);
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

  getById = async (req: Request<BannerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BannerService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<BannerInputUpdate["params"], {}, BannerInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await BannerService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<BannerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await BannerService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new BannerController();
