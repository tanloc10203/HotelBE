import { ImagesRoomTypeInputCreate, ImagesRoomTypeInputUpdate } from "@/schema";
import { ImagesRoomTypeService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";

class ImagesRoomTypeController {
	create = async (req: Request<{}, {}, ImagesRoomTypeInputCreate>, res: Response) => {
		const response = await ImagesRoomTypeService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const { filters, options } = handleFilterQuery(req);
		const response = await ImagesRoomTypeService.getAll(filters, options);
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

	getById = async (req: Request<ImagesRoomTypeInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await ImagesRoomTypeService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<ImagesRoomTypeInputUpdate["params"], {}, ImagesRoomTypeInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await ImagesRoomTypeService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<ImagesRoomTypeInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await ImagesRoomTypeService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new ImagesRoomTypeController();