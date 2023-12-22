import {
  JWT_EXPIRED,
  NOT_VERIFY,
  REFRESH_TOKEN_OR_USER_UN_AUTHORIZATION,
  SOMETHING_WRONG_HAPPEN_REFRESH_TOKEN,
  STATUS_BANNED,
  STATUS_PHONE_DELETE,
  USER_NOT_FOUND,
} from "@/constants";
import { twilio } from "@/helpers";
import { Transaction, resultUrlImage } from "@/lib";
import {
  ApiKey,
  ApiKeyModel,
  AuthModel,
  Customer,
  CustomerInfo,
  CustomerInfoModel,
  CustomerModel,
} from "@/models";
import {
  AddFromFrontDeskInput,
  CustomerCreateMobileInput,
  CustomerInputUpdate,
  CustomerUpdateProfileMobileInput,
} from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  NotFoundRequestError,
  compareHashPassword,
  convertPhoneNumberVi,
  createTokenPair,
  dateTimeSql,
  generateApiKey,
  generateJWT,
  generateOtp,
  getInfoData,
  hashPassword,
  isNull,
  verifyTokenPair,
} from "@/utils";
import { ObjectType, Pagination, RefreshTokenProps } from "types";
import ApiKeyService from "./ApiKey.service";
import CustomerInfoService from "./CustomerInfo.service";
import CustomerTypeService from "./CustomerType.service";
import AuthService from "./Auth.service";
import RefreshTokensUseService from "./RefreshTokensUse.service";
import TokenPairService from "./TokenPair.service";

type Update = Partial<Customer & CustomerInputUpdate["body"]>;

class CustomerService extends AuthModel {
  static create = async (data: Customer) => {
    return await CustomerModel.create(data);
  };

  static addFromFrontDesk = async (data: AddFromFrontDeskInput, ipAddress: string) => {
    const [customerType, phoneNumberExist] = await Promise.all([
      CustomerTypeService.findOne({ is_default: 1 }),
      CustomerModel.findOne<Customer>({
        phone_number: data.phone_number,
      }),
    ]);

    if (phoneNumberExist) {
      throw new ConflictRequestError("Số điện thoại đã tồn tại");
    }

    let customerTypeId = 1; // default 1 <=> Customer normal

    if (customerType) {
      customerTypeId = customerType.id!;
    }

    const key = generateApiKey();

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();
    const display_name = `${data.last_name}  ${data.first_name}`;

    try {
      await connect.beginTransaction();

      const lastInsertId = await transaction.create<Customer>({
        data: {
          phone_number: data.phone_number,
          password: "",
          status: "active",
          customer_type_id: customerTypeId,
          display_name,
          email: data.email || "",
          username: "",
        },
        pool: connect,
        table: CustomerModel.getTable,
      });

      await Promise.all([
        transaction.create<ApiKey>({
          data: {
            ip_address: ipAddress,
            customer_id: lastInsertId,
            key,
            status: "active",
          },
          pool: connect,
          table: ApiKeyModel.getTable,
        }),
        transaction.create<CustomerInfo>({
          data: {
            customer_id: lastInsertId,
            first_name: data.first_name,
            last_name: data.last_name,
            address: data.address,
            birth_date: data.birth_date,
            desc: data.desc,
            gender: data.gender,
          },
          pool: connect,
          table: CustomerInfoModel.getTable,
        }),
      ]);

      return lastInsertId;
    } catch (error) {
      await connect.rollback();
      throw error;
    } finally {
      await connect.commit();
      connect.release();
      transaction.releaseConnection(connect);
    }
  };

  /**
   * @description
   * 1. Get phone number and customer type id default
   * 2. Hash password and generate api key
   * 3. Create otp and hash otp with jwt secure key is api key
   * 3. Create user.
   * 4. Create api key
   * 6. Send Otp.
   * 7. Complete. Return api key
   * @param data
   */
  static createMobile = async (data: CustomerCreateMobileInput, ipAddress: string) => {
    const [customerType, phoneNumberExist] = await Promise.all([
      CustomerTypeService.findOne({ is_default: 1 }),
      CustomerModel.findOne<Customer>({
        phone_number: data.phone_number,
      }),
    ]);

    if (phoneNumberExist) {
      throw new ConflictRequestError("Số điện thoại đã tồn tại");
    }

    let customerTypeId = 1; // default 1 <=> Customer normal

    if (customerType) {
      customerTypeId = customerType.id!;
    }

    const password = await hashPassword(data.password);
    const key = generateApiKey();
    const otp = generateOtp();
    const hashOtp = generateJWT({
      payload: { otp },
      secureKey: key,
      expiresIn: "60s",
    });

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();

      const lastInsertId = await transaction.create<Customer>({
        data: {
          phone_number: data.phone_number,
          password,
          status: "verify",
          customer_type_id: customerTypeId,
          display_name: "",
          email: "",
          username: "",
          phone_number_verify_token: hashOtp,
        },
        pool: connect,
        table: CustomerModel.getTable,
      });

      await Promise.all([
        transaction.create({
          data: {
            ip_address: ipAddress,
            customer_id: lastInsertId,
            key,
          },
          pool: connect,
          table: ApiKeyModel.getTable,
        }),
        twilio.sendMessage(
          `Mã xác thực ECHotel của bạn là: ${otp}`,
          convertPhoneNumberVi(data.phone_number)
        ),
      ]);

      return { apiKey: key, userId: lastInsertId };
    } catch (error) {
      await connect.rollback();
      throw error;
    } finally {
      await connect.commit();
      connect.release();
      transaction.releaseConnection(connect);
    }
  };

  /**
   * @description
   * 1. Select user and api key by user id
   * 2. Check api key input compare api key db
   * 3. Check status === verified or not exist phone_number_verify_token return true
   * 4. Check expiresIn otp verify jwt
   * 5. Verify otp
   * 6. Update status phone verified at => datatype datetime sql `YYYY-MM-DD hh:mm:ss`
   * 7. Complete next step => Update profile
   * @param apiKey
   * @param userId
   */
  static verifyCode = async (apiKey: string, userId: number, otp: string) => {
    const [customer, apiKeyDb] = await Promise.all([
      CustomerModel.findOne<Customer>({ id: userId }),
      ApiKeyService.findOne({ customer_id: userId }),
    ]);

    if (!customer || !apiKeyDb) throw new BadRequestError("Vui lòng đăng ký trước khi xác thưc.");

    if (apiKey !== apiKeyDb.key)
      throw new BadRequestError("Api key không hợp lệ. Vui lòng đăng ký.");

    if (!customer.phone_number_verify_token || customer.status === "verified") return true;

    try {
      const decode = verifyTokenPair<{ otp: string }>(customer.phone_number_verify_token, apiKey);

      if (otp !== decode.otp) {
        throw new BadRequestError("Sai mã xác thực. Vui lòng nhập lại");
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        throw new ForbiddenRequestError(
          "Mã xác thực đã hết hạn vui lòng thử lại.",
          undefined,
          JWT_EXPIRED
        );
      }
      throw error;
    }

    await CustomerService.update(
      { phone_verified_at: dateTimeSql(), phone_number_verify_token: null, status: "verified" },
      userId
    );

    return true;
  };

  /**
   * @description
   * 1. Select user and api key by user id
   * 2. Check api key input compare api key db
   * 3. Check status === verified or not exist phone_number_verify_token return true
   * 4. Generate new otp and hash otp with secure key is api key in db
   * 5. Update hash otp to db and send sms to phone number of customer
   * 6. Return true
   * @param userId
   * @param apiKey
   */
  static resendCode = async (apiKey: string, userId: number) => {
    const [customer, apiKeyDb] = await Promise.all([
      CustomerModel.findOne<Customer>({ id: userId }),
      ApiKeyService.findOne({ customer_id: userId }),
    ]);

    if (!customer || !apiKeyDb) throw new BadRequestError("Vui lòng đăng ký trước khi xác thưc.");

    if (apiKey !== apiKeyDb.key)
      throw new BadRequestError("Api key không hợp lệ. Vui lòng đăng ký.");

    if (!customer.phone_number_verify_token || customer.status === "verified") return true;

    const otp = generateOtp();
    const hashOtp = generateJWT({
      payload: { otp },
      secureKey: apiKeyDb.key,
      expiresIn: "60s",
    });

    const transaction = new Transaction();
    const connect = await transaction.getPoolTransaction();

    try {
      await connect.beginTransaction();

      await Promise.all([
        transaction.update<Partial<Customer>, Customer>({
          data: {
            phone_number_verify_token: hashOtp,
          },
          key: "id",
          pool: connect,
          table: CustomerModel.getTable,
          valueOfKey: userId,
        }),
        twilio.sendMessage(
          `Mã xác thực ECHotel của bạn là: ${otp}`,
          convertPhoneNumberVi(customer.phone_number!)
        ),
      ]);

      return true;
    } catch (error) {
      await connect.rollback();
      throw error;
    } finally {
      await connect.commit();
      connect.release();
      transaction.releaseConnection(connect);
    }
  };

  /**
   * @description
   * 1. Select user by and api key by user id.
   * 2. Check status !== verified or exist phone_number_verify_token return true
   * 3. Update profile
   * 4. Return true;
   * @param userId
   * @param data
   */
  static updateProfile = async (userId: number, data: CustomerUpdateProfileMobileInput["body"]) => {
    const [customer, apiKeyDb] = await Promise.all([
      CustomerModel.findOne<Customer>({ id: userId }),
      ApiKeyService.findOne({ customer_id: userId }),
    ]);

    if (!customer || !apiKeyDb) throw new BadRequestError("Vui lòng đăng ký trước khi xác thưc.");

    if (customer.phone_number_verify_token || customer.status === "verify")
      throw new ForbiddenRequestError("Bạn chưa xác thực số điện thoại");

    const emailExist = await CustomerService.findOne({ email: data.email });

    if (emailExist && emailExist.id !== userId)
      throw new ConflictRequestError("Vui lòng nhập địa email khác.");

    const { first_name, last_name, gender, ...other } = data;
    const display_name = `${last_name} ${first_name}`;

    await Promise.all([
      CustomerService.update({ ...other, display_name, status: "active" }, userId),
      ApiKeyService.update({ status: "active" }, userId, "customer_id"),
      CustomerInfoService.create({ customer_id: userId, first_name, last_name, gender }),
    ]);

    return true;
  };

  /**
   * @description Check two status: `verify` or `verified` of userId
   * @param userId
   * @param status
   */
  static checkStatus = async (userId: number) => {
    const user = await CustomerService.findOne({ id: userId });

    if (!user) {
      throw new NotFoundRequestError("Chưa đăng ký.", undefined, USER_NOT_FOUND);
    }

    if (user.status === "verify") return { verify: true, verified: false };

    if (user.status === "verified") return { verify: false, verified: true };

    return { verify: false, verified: false };
  };

  /**
   * @description
   * 1. Select customer by phone number
   * 2. Check status and phone number is verified
   * 2. Compare Password.
   * 3. Generate token pair.
   * 4. Return token pair.
   * @param param0
   * @returns
   */
  static loginWithPhoneNumber = async ({ password, phone_number }: CustomerCreateMobileInput) => {
    const customer = await CustomerService.findOne({ phone_number: phone_number });

    if (!customer) {
      throw new NotFoundRequestError("Số điện thoại không chính xác.");
    }

    if (
      !customer.phone_verified_at ||
      customer.status === "verify" ||
      customer.status === "verified"
    ) {
      throw new ForbiddenRequestError(
        "Số điện thoại hoặc thông tin chưa được xác thực.",
        undefined,
        NOT_VERIFY
      );
    }

    if (customer.deleted_at)
      throw new ForbiddenRequestError("Số điện thoại đã bị xóa.", undefined, STATUS_PHONE_DELETE);

    if (customer.status === "banned")
      throw new ForbiddenRequestError(`Số điện thoại đã bị cấm`, undefined, STATUS_BANNED);

    const comparePassword = await compareHashPassword(password, customer.password);

    if (!comparePassword) throw new BadRequestError("Mật khẩu không chính xác.");

    const tokens = await this.generateKeyPairSync(customer.id!, "customer");

    return {
      tokens,
      user: { id: customer.id! },
    };
  };

  static getProfileMobile = async (userId: number) => {
    const userFounder = await CustomerService.getById(userId);

    if (!userFounder) {
      throw new NotFoundRequestError(`User not found. Try again login.`, undefined, USER_NOT_FOUND);
    }

    const user = getInfoData(userFounder, [
      "id",
      "username",
      "display_name",
      "email",
      "phone_number",
      "photo",
      "first_name",
      "last_name",
      "address",
      "birth_date",
      "desc",
      "gender",
    ]);

    return { ...user, photo: user.photo ? resultUrlImage(user.photo!) : null };
  };

  static refreshToken = async ({
    refreshToken,
    tokenPair,
    userId,
  }: Omit<RefreshTokenProps, "type">) => {
    /**
     * 1. Check refreshToken used?
     * 2. If true delete tokenPair return => Error Forbidden
     * 3. Check refreshToken and refreshToken in tokenPair
     * 4. If false return => Error Forbidden
     * 5. Find UserId exist ? => If false return Error Not Found User
     * 6. Generate new Token Pair and update refreshToken
     * 7. Complete Return tokens
     */

    const refreshTokenUsed = await RefreshTokensUseService.findOne({ refresh_token: refreshToken });

    if (refreshTokenUsed) {
      await TokenPairService.deleteById(tokenPair.id!);
      throw new ForbiddenRequestError(
        `Something wrong happened! Try login again.`,
        undefined,
        SOMETHING_WRONG_HAPPEN_REFRESH_TOKEN
      );
    }

    if (tokenPair.refresh_token !== refreshToken) {
      throw new ForbiddenRequestError(
        `Invalid refreshToken or user not registered...`,
        undefined,
        REFRESH_TOKEN_OR_USER_UN_AUTHORIZATION
      );
    }

    const founderUser = await CustomerService.getById(+userId);

    if (!founderUser) {
      throw new NotFoundRequestError(`User not found. Try again`, undefined, USER_NOT_FOUND);
    }

    const tokens = createTokenPair({
      payload: { id: userId },
      privateKey: tokenPair.private_key,
      publicKey: tokenPair.public_key,
    });

    await Promise.all([
      TokenPairService.update({ refresh_token: tokens.refreshToken }, tokenPair.id!),
      RefreshTokensUseService.create({ key_id: tokenPair.id!, refresh_token: refreshToken }),
    ]);

    return {
      user: getInfoData(founderUser, ["id", "display_name"]),
      tokens,
    };
  };

  static update = async (data: Update, id: number, key?: keyof Customer) => {
    if (!(await CustomerModel.update(data, id, key))) {
      throw new BadRequestError(`Có lỗi xảy ra khi cập dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static getById = async (id: number) => {
    const [data, dataInfo] = await Promise.all([
      CustomerModel.findOne<Customer>({ id: id }),
      CustomerInfoService.findOne({ customer_id: id }),
    ]);

    // console.log(`data`, { data, dataInfo });

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
    };
  };

  static findOne = async (conditions: ObjectType<Customer>) => {
    const data = await CustomerModel.findOne<Customer>(conditions);
    return data;
  };

  static getAll = async (filters: Record<string, any>, options: Partial<Pagination>) => {
    filters = { deleted_at: isNull(), ...filters };

    const results = await CustomerModel.findAll<Customer>(filters, "-password", options);

    const total = await CustomerModel.count(filters);

    if (!results.length) return { results: [], total: 0 };

    const info = await Promise.all(
      results.map(
        (row) =>
          new Promise(async (resolve, reject) => {
            try {
              const infoData = await CustomerInfoService.findOne({ customer_id: row.id });
              const type = await CustomerTypeService.findOne({ id: row.customer_type_id });

              const data = getInfoData(row, [
                "id",
                "display_name",
                "username",
                "email",
                "phone_number",
                "status",
                "photo",
              ]);

              resolve({
                ...data,
                photo: data.photo ? resultUrlImage(data.photo) : "",
                dataInfo: infoData,
                type,
              });
            } catch (error) {
              reject(error);
            }
          })
      )
    );

    return { results: info, total };
  };

  static deleteById = async (id: number) => {
    if (!(await CustomerModel.deleteById(id))) {
      throw new NotFoundRequestError(`Đã lỗi xảy ra khi xóa dữ liệu. Không tìm thấy id = ${id}`);
    }

    return true;
  };

  static logout = async (tokenPairId: number) => {
    await TokenPairService.deleteById(tokenPairId);
    return true;
  };
}

export default CustomerService;
