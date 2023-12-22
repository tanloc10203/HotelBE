import { CustomerTypeInputCreate, CustomerTypeInputUpdate } from "@/schema";
import { CustomerTypeService } from "@/services";
import { CreatedResponse, OKResponse } from "@/utils";
import { Request, Response } from "express";

class CustomerTypeController {
	create = async (req: Request<{}, {}, CustomerTypeInputCreate>, res: Response) => {
		const response = await CustomerTypeService.create(req.body);
		return new CreatedResponse({
			message: "Tạo dữ liệu thành công.",
			metadata: { lastInsertId: response },
		}).send(res);
	};

	getAll = async (req: Request<{}, {}, {}>, res: Response) => {
		const filters = req.query;
		const response = await CustomerTypeService.getAll(filters);
		return new OKResponse({
			message: "Lấy danh sách dữ liệu thành công.",
			metadata: response,
			options: filters,
		}).send(res);
	};

	getById = async (req: Request<CustomerTypeInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await CustomerTypeService.getById(+id);
		return new OKResponse({
			message: `Lấy dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	update = async (
		req: Request<CustomerTypeInputUpdate["params"], {}, CustomerTypeInputUpdate["body"]>,
		res: Response
	) => {
		const id = req.params.id;
		const response = await CustomerTypeService.update(req.body, +id);
		return new OKResponse({
			message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};

	delete = async (req: Request<CustomerTypeInputUpdate["params"], {}, {}>, res: Response) => {
		const id = req.params.id;
		const response = await CustomerTypeService.deleteById(+id);
		return new OKResponse({
			message: `Xóa dữ liệu theo id = ${id} thành công.`,
			metadata: response,
		}).send(res);
	};
}

export default new CustomerTypeController();