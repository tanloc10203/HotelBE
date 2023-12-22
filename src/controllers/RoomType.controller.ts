import { RoomTypeInputCreate, RoomTypeInputUpdate } from "@/schema";
import { RoomTypeService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";
import { CommonRequest } from "types";

type ConvertJSONToArray = { id: number }[];

class RoomTypeController {
  create = async (req: CommonRequest<{}, {}, RoomTypeInputCreate>, res: Response) => {
    const images = req.imageId as string[];

    const { amenities, character, desc, equipments, name } = req.body;

    const _amenities = JSON.parse(amenities) as ConvertJSONToArray;
    const _equipments = JSON.parse(equipments) as ConvertJSONToArray;

    const response = await RoomTypeService.create({
      amenities: _amenities,
      character,
      desc,
      name,
      equipments: _equipments,
      images,
    });

    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await RoomTypeService.getAll(filters, options);
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

  getById = async (req: Request<RoomTypeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoomTypeService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<RoomTypeInputUpdate["params"], {}, RoomTypeInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    const images = req.imageId as string[] | undefined;

    const { amenities, character, desc, equipments, name } = req.body;

    const _amenities = JSON.parse(amenities) as ConvertJSONToArray;
    const _equipments = JSON.parse(equipments) as ConvertJSONToArray;

    const response = await RoomTypeService.update(
      {
        amenities: _amenities,
        character,
        desc,
        name,
        equipments: _equipments,
        images,
      },
      +id
    );
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<RoomTypeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoomTypeService.deleteById(+id);
    return new OKResponse({
      message: `Chuyển dữ liệu theo id = ${id} vào thùng rác thành công.`,
      metadata: response,
    }).send(res);
  };

  restore = async (req: Request<RoomTypeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoomTypeService.restore(+id);
    return new OKResponse({
      message: `Khôi phục dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  truncateTrash = async (req: Request<RoomTypeInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await RoomTypeService.truncateTrash(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new RoomTypeController();
