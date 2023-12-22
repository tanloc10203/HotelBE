import { InformationHotelInputCreate, InformationHotelInputUpdate } from "@/schema";
import { InformationHotelService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class InformationHotelController {
  create = async (req: Request<{}, {}, InformationHotelInputCreate>, res: Response) => {
    const response = await InformationHotelService.create(req.body);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await InformationHotelService.getAll(filters, options);
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

  getById = async (req: Request<InformationHotelInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await InformationHotelService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<InformationHotelInputUpdate["params"], {}, InformationHotelInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const response = await InformationHotelService.update(req.body, id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new InformationHotelController();
