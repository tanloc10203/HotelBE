import { ServicesPrice, ServicesPriceModel } from "@/models";
import { ServicesPriceInputCreate, ServicesPriceInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class ServicesPriceService {
	static create = async (data: ServicesPriceInputCreate) => {
		return await ServicesPriceModel.create(data);
	};

	static update = async (data: ServicesPriceInputUpdate["body"], id: number) => {
		let ServicesPrice: ServicesPrice | boolean;

		if (!(await ServicesPriceModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await ServicesPriceModel.findOne<ServicesPrice>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: Record<string, any>, options: Pagination) => {
		const results = await ServicesPriceModel.findAll<ServicesPrice>(filters, undefined, options);
		const total = await ServicesPriceModel.count(filters);
		if (!results.length) return { results: [], total: 0 };
		return { results, total };
	};

	static findOne = async (conditions: ObjectType<ServicesPrice>) => {
		return await ServicesPriceModel.findOne<ServicesPrice>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await ServicesPriceModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default ServicesPriceService;
