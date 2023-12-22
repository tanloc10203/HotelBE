import { OperationInputCreate, OperationInputUpdate } from "@/schema";
import { OperationService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class OperationController {
	create = async (req: Request<{}, {}, OperationInputCreate>, res: Response) => {
		const response = await OperationService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await OperationService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<OperationInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await OperationService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<OperationInputUpdate["params"], {}, OperationInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await OperationService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<OperationInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await OperationService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new OperationController();