import {
  ApiKey,
  ApiKeyModel,
  Employee,
  EmployeeInfo,
  EmployeeInfoModel,
  EmployeeModel,
  Operation,
  OperationModel,
  RoleEmployeeModel,
} from "@/models";
import {
  BadRequestError,
  ConflictRequestError,
  NotFoundRequestError,
  generateApiKey,
  getInfoData,
  hashPassword,
  removeNullObj,
} from "@/utils";
import { ObjectType, Pagination } from "types";
import EmployeeInfoService from "./EmployeeInfo.service";
import { CustomerInputUpdate, EmployeeInputCreate, EmployeeInputUpdate } from "@/schema";
import RoleEmployeeService from "./RoleEmployee.service";
import { Transaction } from "@/lib";
import OperationService from "./Operation.service";

type Update = Employee & CustomerInputUpdate["body"];

class EmployeeService {
  static create = async (data: Employee) => {
    return await EmployeeModel.create(data);
  };

  static add = async (data: EmployeeInputCreate, ipAddress: string) => {
    let [emailExist, phoneNumberExist, usernameExist] = await Promise.all([
      EmployeeService.findOne({ email: data.email }),
      EmployeeService.findOne({ phone_number: data.phone_number }),
      EmployeeService.findOne({ username: data.username }),
    ]);

    if (emailExist || phoneNumberExist || usernameExist) {
      throw new ConflictRequestError(`Email hoặc số điện thoại hoặc tài khoản đã tồn tại`);
    }

    const { first_name, last_name, roles, position, department, username, gender } = data;

    const displayName = `${last_name} ${first_name}`;
    const key = generateApiKey();
    const transaction = new Transaction();

    const [password, connection] = await Promise.all([
      hashPassword(data.password),
      transaction.getPoolTransaction(),
    ]);

    try {
      await connection.beginTransaction();

      const lastInsertId = await transaction.create<Employee>({
        data: {
          display_name: displayName,
          password,
          username,
          email: data.email,
          phone_number: data.phone_number,
          status: "active",
        },
        pool: connection,
        table: EmployeeModel.getTable,
      });

      const insertBulk = roles.map((role) => [lastInsertId, role.id]);

      await Promise.all([
        transaction.create<EmployeeInfo>({
          data: {
            employee_id: lastInsertId,
            first_name,
            last_name,
            gender,
          },
          pool: connection,
          table: EmployeeInfoModel.getTable,
        }),
        transaction.create<ApiKey>({
          data: {
            ip_address: ipAddress,
            key,
            employee_id: lastInsertId,
            permissions: "1111",
            status: "active",
          },
          pool: connection,
          table: ApiKeyModel.getTable,
        }),
        transaction.createBulk({
          pool: connection,
          data: insertBulk,
          fillables: RoleEmployeeModel.getFillables,
          table: RoleEmployeeModel.getTable,
        }),
        transaction.create<Operation>({
          pool: connection,
          data: { department_id: +department, employee_id: lastInsertId, position_id: +position },
          table: OperationModel.getTable,
        }),
      ]);

      await connection.commit();

      const dataAfterInsertAll = await EmployeeService.getById(lastInsertId);

      return dataAfterInsertAll;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
      transaction.releaseConnection(connection);
    }
  };

  static update = async (data: Partial<Update>, id: number, key?: keyof Employee) => {
    if (!(await EmployeeModel.update<Partial<Update>, Employee>(data, id, key))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static updateV2 = async (data: EmployeeInputUpdate["body"], id: number) => {
    let [emailExist, phoneNumberExist, operations] = await Promise.all([
      EmployeeService.findOne({ email: data.email }),
      EmployeeService.findOne({ phone_number: data.phone_number }),
      OperationService.findOne({ employee_id: id }),
    ]);

    if (emailExist && emailExist.id! !== id) {
      throw new ConflictRequestError(`Email đã tồn tại`);
    }

    if (phoneNumberExist && phoneNumberExist.id! !== id) {
      throw new ConflictRequestError(`Số điện thoại đã tồn tại`);
    }

    const { first_name, last_name, roles, position, department, gender, status } = data;

    const displayName = `${last_name} ${first_name}`;

    await Promise.all([
      RoleEmployeeService.create({ employee_id: id, roles }),
      EmployeeService.update(
        { display_name: displayName, email: data.email, phone_number: data.phone_number, status },
        id
      ),
      EmployeeInfoService.update({ first_name, last_name, gender }, id, "employee_id"),
      operations
        ? OperationService.update(
            { employee_id: id + "", position_id: position, department_id: department },
            id,
            "employee_id"
          )
        : OperationService.create({
            employee_id: id + "",
            position_id: position,
            department_id: department,
          }),
    ]);

    return true;
  };

  static getById = async (id: number) => {
    const [data, dataInfo, roles, operations] = await Promise.all([
      EmployeeModel.findOne<Employee>({ id: id }),
      EmployeeInfoService.findOne({ employee_id: id }),
      RoleEmployeeService.getByEmployeeId(id),
      OperationService.getByEmployeeId(id),
    ]);

    if (!data || !dataInfo) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return {
      ...data,
      ...getInfoData(dataInfo, [
        "address",
        "birth_date",
        "desc",
        "first_name",
        "gender",
        "last_name",
      ]),
      roles,
      department: operations.department,
      position: operations.position,
    };
  };

  static getByIdV2 = async (id: number, conditions?: Partial<Record<keyof Employee, any>>) => {
    const [data, dataInfo, roles, operations] = await Promise.all([
      EmployeeModel.findOne<Employee>(
        { id: id, ...conditions },
        "-password -remember_token -email_verify_token -email_verified_at -phone_verified_at"
      ),
      EmployeeInfoService.findOne({ employee_id: id }),
      RoleEmployeeService.getByEmployeeId(id),
      OperationService.getByEmployeeId(id),
    ]);

    if (!data || !dataInfo) {
      throw new NotFoundRequestError(`Đã có lỗi xảy ra khi tìm dữ liêu. Không tìm thấy id = ${id}`);
    }

    return {
      ...data,
      employeeInfo: dataInfo,
      roles,
      department: operations.department,
      position: operations.position,
    };
  };

  static findOne = async (conditions: ObjectType<Employee>, select = "") => {
    const response = await EmployeeModel.findOne<Employee>(conditions, select);

    return response;
  };

  static getAll = async (filters: Record<string, any>, options: Pagination) => {
    let employees: Employee[] = [];

    if (filters?.department || filters?.position) {
      let operationsFilter: Partial<Record<keyof Operation, any>> = {
        department_id: filters?.department ? +filters?.department : null,
        position_id: filters?.position ? +filters?.position : null,
      };

      const operations = await OperationService.getAll(removeNullObj(operationsFilter));

      delete filters.department;
      delete filters.position;

      if (!operations.length) return { results: [], total: 0 };

      const results = await Promise.all(
        operations.map(
          (operation) =>
            new Promise(async (resolve, reject) => {
              try {
                const response = await EmployeeService.getByIdV2(operation.employee_id, filters);
                resolve(response);
              } catch (error) {
                reject(error);
              }
            })
        )
      );

      const total = results.length;

      return { results, total };
    }

    employees = await EmployeeModel.findAll<Employee>(
      filters,
      "-password -remember_token -email_verify_token -email_verified_at -phone_verified_at",
      options
    );

    const total = await EmployeeModel.count(filters);

    if (!employees.length) return { results: [], total: 0 };

    const results = await Promise.all(
      employees.map(
        (employee) =>
          new Promise(async (resolve, reject) => {
            try {
              const [employeeInfo, roles, operations] = await Promise.all([
                EmployeeInfoService.findOne({ employee_id: employee.id }),
                RoleEmployeeService.getByEmployeeId(employee.id!),
                OperationService.getByEmployeeId(employee.id!),
              ]);

              resolve({
                ...employee,
                employeeInfo: employeeInfo!,
                roles,
                department: operations.department,
                position: operations.position,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results, total };
  };

  static deleteById = async (id: number) => {
    if (!(await EmployeeModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };
}

export default EmployeeService;
