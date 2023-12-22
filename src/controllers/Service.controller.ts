import {
  ServiceInputCreate,
  ServiceInputUpdate,
  ServiceProductAddInput,
  ServiceProductUpdate,
} from "@/schema";
import { ServiceService } from "@/services";
import { AttributeType, UnitsType } from "@/services/Service.service";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";
import { CommonRequest } from "types";

class ServiceController {
  create = async (req: CommonRequest<{}, {}, ServiceInputCreate>, res: Response) => {
    const { name, service_type_id, desc, units, note, price_original, price_sell, timer } =
      req.body;

    const photo_public = req.imageId as string;

    const response = await ServiceService.create({
      name,
      desc,
      note,
      photo_public: photo_public ? photo_public : null,
      price_original: price_original ? +price_original : 0,
      price_sell: +price_sell,
      timer: timer ? +timer : null,
      units: JSON.parse(units) as UnitsType[],
      service_type_id,
    });

    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  createProduct = async (req: CommonRequest<{}, {}, ServiceProductAddInput>, res: Response) => {
    const {
      attributes,
      min_quantity_product,
      name,
      price_original,
      price_sell,
      quantity,
      service_type_id,
      units,
      desc,
      note,
    } = req.body;

    const photo_public = req.imageId as string;

    const response = await ServiceService.createProduct({
      attributes: JSON.parse(attributes) as AttributeType[],
      min_quantity_product: +min_quantity_product,
      name,
      price_original: +price_original,
      price_sell: +price_sell,
      quantity: +quantity,
      service_type_id: service_type_id,
      units: JSON.parse(units) as UnitsType[],
      desc,
      note,
      photo_public,
    });

    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: { lastInsertId: response },
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await ServiceService.getAll(filters, options);
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

  getById = async (req: Request<ServiceInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ServiceService.getById(id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: CommonRequest<ServiceInputUpdate["params"], {}, ServiceInputUpdate["body"]>,
    res: Response
  ) => {
    const {
      name,
      price_id,
      service_type_id,
      desc,
      units,
      note,
      price_original,
      price_sell,
      timer,
    } = req.body;

    const photo_public = req.imageId as string;

    const response = await ServiceService.update(
      {
        name,
        desc,
        note,
        price_id,
        photo_public: photo_public ? photo_public : null,
        price_original: price_original ? +price_original : 0,
        price_sell: +price_sell,
        timer: timer ? +timer : null,
        units: JSON.parse(units) as UnitsType[],
        service_type_id,
      },
      req.params.id
    );

    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${req.params.id} thành công.`,
      metadata: response,
    }).send(res);
  };

  updateProduct = async (
    req: CommonRequest<ServiceProductUpdate["params"], {}, ServiceProductUpdate["body"]>,
    res: Response
  ) => {
    const {
      attributes,
      min_quantity_product,
      name,
      price_original,
      price_sell,
      quantity,
      price_id,
      service_type_id,
      units,
      desc,
      note,
    } = req.body;

    const photo_public = req.imageId as string;

    const response = await ServiceService.updateProduct(
      {
        attributes: JSON.parse(attributes || "[]") as AttributeType[],
        min_quantity_product: +min_quantity_product,
        name,
        price_original: +price_original,
        price_sell: +price_sell,
        quantity: +quantity,
        service_type_id: service_type_id,
        units: JSON.parse(units) as UnitsType[],
        desc,
        note,
        photo_public,
        price_id,
      },
      req.params.id
    );

    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${req.params.id} thành công.`,
      metadata: response,
    }).send(res);
  };

  delete = async (req: Request<ServiceInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await ServiceService.deleteById(id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new ServiceController();
