import {
  FORMAT_DATETIME_SQL,
  JWT_EXPIRED,
  REFRESH_TOKEN_OR_USER_UN_AUTHORIZATION,
  SOMETHING_WRONG_HAPPEN_REFRESH_TOKEN,
  ServicesAuth,
  USER_NOT_FOUND,
} from "@/constants";
import { Templates, sendEmail, validateRealMail } from "@/helpers";
import { AuthModel, TokenPair } from "@/models";
import { AuthChangePasswordInput } from "@/schema";
import {
  BadRequestError,
  ConflictRequestError,
  ForbiddenRequestError,
  InternalServerRequestError,
  NotFoundRequestError,
  compareHashPassword,
  createTokenPair,
  dateTimeSql,
  generateTokenOTP,
  getConditions,
  getInfoData,
  getKeyUserTypes,
  hashPassword,
  verifyTokenPair,
} from "@/utils";
import { env } from "config";
import moment from "moment";
import {
  AuthChangeProfile,
  ForgotPasswordProps,
  GetProfileProps,
  LoginProps,
  RefreshTokenProps,
  RegisterProps,
  ResetPasswordProps,
  UpdatePhotoProps,
} from "types";
import ApiKeyService from "./ApiKey.service";
import RefreshTokensUseService from "./RefreshTokensUse.service";
import TokenPairService from "./TokenPair.service";
import { handleImageId, removeImage, resultUrlImage } from "@/lib";

class AuthService extends AuthModel {
  static login = async ({ data, type }: LoginProps) => {
    /**
     * 1. Check username.
     * 2. Check password.
     * 3. Check isActive account
     * 4. Generate token: accessToken, refreshToken
     * 5. Create TokenPair from token
     * 6. Complete. Return Token
     */

    const Service = ServicesAuth["Index"][type]();

    const user = await Service.findOne({ username: data.username });

    if (!user) {
      throw new BadRequestError("Tài khoản hoặc mật khẩu không đúng!");
    }

    const comparePassword = await compareHashPassword(data.password, user.password);

    if (!comparePassword) {
      throw new BadRequestError("Tài khoản hoặc mật khẩu không đúng!");
    }

    if (user.status === "inactive") {
      throw new BadRequestError(`Vui lòng xác thực email ${user.email} và thử lại!`);
    }

    const tokens = await this.generateKeyPairSync(user.id!, type);

    return {
      user: getInfoData(user, ["id", "display_name"]),
      tokens,
    };
  };

  static register = async ({ data, type, ip_address }: RegisterProps & { ip_address: string }) => {
    if (type === "customer") {
      return this.registerCustomer({ ...data, ip_address });
    }

    if (type === "owner") {
      return this.registerOwner({ ...data, ip_address });
    }

    return this.registerEmployee({ ...data, ip_address });
  };

  static refreshToken = async ({ refreshToken, tokenPair, userId, type }: RefreshTokenProps) => {
    /**
     * 1. Check refreshToken used?
     * 2. If true delete tokenPair return => Error Forbidden
     * 3. Check refreshToken and refreshToken in tokenPair
     * 4. If false return => Error Forbidden
     * 5. Find UserId exist ? => If false return Error Not Found User
     * 6. Generate new Token Pair and update refreshToken
     * 7. Complete Return tokens
     */

    const refreshTokenUsed = await RefreshTokensUseService.findOne({
      refresh_token: refreshToken,
      key_id: tokenPair.id!,
    });

    // console.log(`refreshTokenUsed`, {
    //   refreshTokenUsed,
    //   ...{ refreshToken, tokenPair, userId, type },
    // });

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

    const Service = ServicesAuth["Index"][type]();

    const founderUser = await Service.getById(+userId);

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

  static profile = async ({ type, userId }: GetProfileProps) => {
    const Service = ServicesAuth["Index"][type]();

    const userFounder = await Service.getById(userId);

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

  static changePassword = async ({
    password,
    type,
    userId,
    newPassword,
  }: GetProfileProps & AuthChangePasswordInput) => {
    /**
     * 1. Get user by userId.
     * 2. Compare password.
     * 3. Hash New Password.
     * 4. Update Password .
     * 5. Complete. return true.
     */

    const Service = ServicesAuth["Index"][type]();

    const userFounder = await Service.getById(userId);

    if (!userFounder) {
      throw new NotFoundRequestError(`User not found. Try again.`);
    }

    const comparePassword = await compareHashPassword(password, userFounder.password);

    if (!comparePassword) {
      throw new BadRequestError("Mật khẩu cũ không chính xác. Vui lòng thử lại!");
    }

    const securePassword = await hashPassword(newPassword);

    const updateUser = await Service.update({ password: securePassword }, userFounder.id!);

    if (!updateUser) {
      throw new BadRequestError(`Thay đổi mật khẩu không thành công. Thử lại sau.`);
    }

    return true;
  };

  static updateProfile = async ({ data, type, userId }: AuthChangeProfile) => {
    /**
     * 1. Merge first name and last name => display name.
     * 2. Update profile
     * 3. Complete => return new profile;
     */

    const { phone_number, ...other } = data;
    const displayName = `${other.last_name} ${other.first_name}`;

    const ServiceIndex = ServicesAuth["Index"][type]();
    const ServiceProfile = ServicesAuth["Profile"][type]();
    const key =
      type === "customer" ? "customer_id" : type === "employee" ? "employee_id" : "owner_id";

    await Promise.all([
      ServiceIndex.update({ display_name: displayName, phone_number: phone_number }, userId),
      ServiceProfile.update(other, userId, key as any),
    ]);

    const response = await AuthService.profile({ type, userId });

    return response;
  };

  static forgotPassword = async ({ data, type }: ForgotPasswordProps) => {
    /**
     * 1. Select user by data.username. If false throw new NotfoundError.
     * 2. Check user had reset password exists.
     * 3. => If true return check email
     * 4. Optional Check email address.
     * 5. Generate token reset password.
     * 6. Create url reset password.
     * 7. Hash Token with JWT expiresIn 30s
     * 8. Update token reset password in user.
     * 9. Send email.
     * 10. Complete return check email.
     */

    const Service = ServicesAuth["Index"][type]();

    const userFounder = await Service.findOne({ username: data.username });

    if (!userFounder) {
      throw new NotFoundRequestError(`Không tìm thấy tài khoản. Vui lòng nhập đúng tài khoản`);
    }

    if (userFounder.remember_token) {
      throw new ConflictRequestError(`Vui lòng kiểm tra email để có thể thay đổi mật khẩu`);
    }

    const conditions = getConditions(userFounder.id!, type);

    const [_, apiKey] = await Promise.all([
      validateRealMail(data.email),
      ApiKeyService.findOne(conditions),
    ]);

    console.log("====================================");
    console.log(`api Key`, apiKey);
    console.log("====================================");

    if (!apiKey) {
      throw new ForbiddenRequestError(`Có vẻ bạn chưa đăng ký tài khoản.`);
    }

    if (apiKey.status === "inactive") {
      throw new ForbiddenRequestError(`Có vẻ bạn chưa xác thực tài khoản.`);
    }

    const { TOKEN, hashToken } = generateTokenOTP(apiKey.key, undefined);

    const URL_RESET_PASSWORD = `${env.CLIENT_ORIGIN_WEB}/reset/password/${userFounder.id}/${TOKEN}/${type}`;

    try {
      await Promise.all([
        Service.update({ remember_token: hashToken }, userFounder.id!),
        sendEmail({
          subject: "Quên mật khẩu",
          html: Templates.forgotPassword({
            displayName: userFounder.display_name,
            email: data.email,
            url: URL_RESET_PASSWORD,
          }),
          to: data.email,
        }),
      ]);

      return URL_RESET_PASSWORD;
    } catch (error: any) {
      await Service.update({ remember_token: null }, userFounder.id!);
      throw new InternalServerRequestError(error.message);
    }
  };

  static resetPassword = async ({ data, token, type, userId }: ResetPasswordProps) => {
    /**
     * 1. Get user by user id.
     * 2. Check token exists
     * 3. Check token expires
     * 4. Compare token hash with token
     * 5. hash new password.
     * 6. update new password and remove token
     * 7. Complete return true.
     */

    const Service = ServicesAuth["Index"][type]();
    const conditions = getConditions(userId, type);

    const [userFounder, apiKey] = await Promise.all([
      Service.getById(userId),
      ApiKeyService.findOne(conditions),
    ]);

    if (!userFounder || !apiKey) {
      throw new ForbiddenRequestError(`Không tìm thấy tài khoản. Vui lòng đăng ký tài khoản.`);
    }

    if (
      !userFounder.email_verified_at ||
      userFounder.status === "inactive" ||
      apiKey.status === "inactive"
    ) {
      throw new ForbiddenRequestError(`Có vẻ bạn chưa xác thực tài khoản.`);
    }

    if (!userFounder.remember_token) {
      throw new ForbiddenRequestError(
        `Giao dịch của bạn đã hết hạn. Vui lòng gửi yêu cầu quên mật khẩu để được thực hiện lại.`,
        undefined,
        JWT_EXPIRED
      );
    }

    try {
      const decode = verifyTokenPair<{ token: string }>(userFounder.remember_token, apiKey.key);

      if (decode.token !== token) {
        await Service.update({ remember_token: null }, userId);
        throw new ForbiddenRequestError(`Mã token không hợp lệ. Vui lòng thử lại`);
      }
    } catch (error: any) {
      if (error.message === "jwt expired") {
        await Service.update({ remember_token: null }, userId);
        throw new ForbiddenRequestError(
          `Mã token của bạn đã hết hạn trong ${env.EXPIRES_IN_RESET_PASSWORD}. Vui lòng thực hiện lại tác vụ.`,
          undefined,
          JWT_EXPIRED
        );
      }

      throw error;
    }

    const securePassword = await hashPassword(data.password);

    const updateUser = await Service.update(
      { password: securePassword, remember_token: null },
      userId
    );

    if (!updateUser) {
      throw new BadRequestError(`Thay đổi mật khẩu không thành công. Thử lại sau.`);
    }

    return true;
  };

  static verifyAccount = async ({ type, userId }: GetProfileProps) => {
    /**
     * 1. Select User And Api Key By userId
     * 2. Check if verified email true return true
     * 1. Update date verified email and status active
     * 2. Update status apiKey active
     */

    const Service = ServicesAuth["Index"][type]();
    const conditions = getConditions(userId, type);

    const [userFounder, apiKey] = await Promise.all([
      Service.getById(userId),
      ApiKeyService.findOne(conditions),
    ]);

    if (!userFounder || !apiKey) {
      throw new ForbiddenRequestError(`Không tìm thấy tài khoản. Vui lòng đăng ký tài khoản.`);
    }

    if (
      userFounder.email_verified_at ||
      userFounder.status === "active" ||
      apiKey.status === "active"
    ) {
      throw new ConflictRequestError(`Bạn đã xác thực tài khoản`);
    }

    await Promise.all([
      Service.update(
        {
          email_verified_at: dateTimeSql(),
          status: "active",
        },
        userId
      ),
      ApiKeyService.update({ status: "active" }, userId, getKeyUserTypes(type)),
    ]);

    return true;
  };

  static updatePhoto = async ({ imageId, type, userId }: UpdatePhotoProps) => {
    const Service = ServicesAuth["Index"][type]();

    const userFounder = await Service.getById(userId);

    if (userFounder.photo) {
      const { id, folder } = handleImageId(userFounder.photo);
      const publicId = `${folder}/${id}`;
      await removeImage(publicId);
    }

    await Service.update({ photo: imageId }, userId);

    return true;
  };

  static logout = async (tokenPairId: number) => {
    const response = await TokenPairService.deleteById(tokenPairId);
    return response;
  };
}

export default AuthService;
