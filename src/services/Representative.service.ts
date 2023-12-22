import { Representative, RepresentativeModel } from "@/models";
import { RepresentativeInputCreate, RepresentativeInputUpdate } from "@/schema";
import { BadRequestError, ConflictRequestError, NotFoundRequestError } from "@/utils";
import { ObjectType, Pagination } from "types";

class RepresentativeService {
	static create = async (data: RepresentativeInputCreate) => {
		return await RepresentativeModel.create(data);
	};

	static update = async (data: RepresentativeInputUpdate["body"], id: number) => {
		let Representative: Representative | boolean;

		if (!(await RepresentativeModel.update(data, id))) {
			throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};

	static getById = async (id: number) => {
		const data = await RepresentativeModel.findOne<Representative>({ id: id });

		if (!data) {
			throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
		}

		return data;
	};

	static getAll = async (filters: Record<string, any>, options: Pagination) => {
		const results = await RepresentativeModel.findAll<Representative>(filters, undefined, options);
		const total = await RepresentativeModel.count(filters);
		if (!results.length) return { results: [], total: 0 };
		return { results, total };
	};

	static findOne = async (conditions: ObjectType<Representative>) => {
		return await RepresentativeModel.findOne<Representative>(conditions);
	};

	static deleteById = async (id: number) => {
		if (!(await RepresentativeModel.deleteById(id))) {
			throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
		}

		return true;
	};
}

export default RepresentativeService;
