import {
  AddFromFrontDeskInput,
  CheckStatusCustomerInput,
  CustomerCreateMobileInput,
  CustomerInputUpdate,
  CustomerResendCodeMobileInput,
  CustomerUpdateProfileMobileInput,
  CustomerVerifyCodeMobileInput,
} from "@/schema";
import { CustomerService } from "@/services";
import { CreatedResponse, OKResponse, handleFilterQuery } from "@/utils";
import { Request, Response } from "express";
import { CommonRequest } from "types";

class CustomerController {
  create = async (req: Request<{}, {}, CustomerCreateMobileInput>, res: Response) => {
    const response = await CustomerService.createMobile(req.body, req.ip);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  addFromFrontDesk = async (req: Request<{}, {}, AddFromFrontDeskInput>, res: Response) => {
    const response = await CustomerService.addFromFrontDesk(req.body, req.ip);
    return new CreatedResponse({
      message: "Tạo dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  loginWithPhoneNumber = async (req: Request<{}, {}, CustomerCreateMobileInput>, res: Response) => {
    const response = await CustomerService.loginWithPhoneNumber(req.body);

    // res.cookie(CookieHeaders.REFRESH_TOKEN_CUSTOMER, tokens.refreshToken, COOKIE_OPTIONS);
    // res.cookie(CookieHeaders.X_CLIENT_ID_CUSTOMER, user.id, COOKIE_OPTIONS);
    // res.cookie(CookieHeaders.X_API_KEY_CUSTOMER, tokens.apiKey?.key, COOKIE_OPTIONS);

    req.session.userId = response.user.id;
    req.session.accessToken = response.tokens.accessToken;
    req.session.refreshToken = response.tokens.refreshToken;

    return new OKResponse({
      message: "Đăng nhập thành công.",
      metadata: response,
    }).send(res);
  };

  refreshTokenMobile = async (req: CommonRequest, res: Response) => {
    const response = await CustomerService.refreshToken({
      refreshToken: req.refreshToken!,
      tokenPair: req.tokenPair!,
      userId: +req.userId!,
    });

    // res.cookie(CookieHeaders.REFRESH_TOKEN_CUSTOMER, tokens.refreshToken, COOKIE_OPTIONS);
    // res.cookie(CookieHeaders.X_CLIENT_ID_CUSTOMER, user.id, COOKIE_OPTIONS);
    // res.cookie(CookieHeaders.X_API_KEY_CUSTOMER, tokens.apiKey?.key, COOKIE_OPTIONS);

    return new OKResponse({
      message: "RefreshToken thành công.",
      metadata: response,
    }).send(res);
  };

  getProfileMobile = async (req: CommonRequest<{}, {}, {}>, res: Response) => {
    const response = await CustomerService.getProfileMobile(req.userId!);

    return new OKResponse({
      message: "Lấy thông tin cá nhân thành công",
      metadata: response,
    }).send(res);
  };

  verifyCode = async (req: Request<{}, {}, CustomerVerifyCodeMobileInput>, res: Response) => {
    await CustomerService.verifyCode(req.body.api_key, +req.body.user_id, req.body.otp);
    return new OKResponse({
      message: "Xác thực thành công",
      metadata: {},
    }).send(res);
  };

  resendCode = async (req: Request<{}, {}, CustomerResendCodeMobileInput>, res: Response) => {
    await CustomerService.resendCode(req.body.api_key, +req.body.user_id);
    return new OKResponse({
      message: "Gửi lại mã xác thực thành công",
      metadata: {},
    }).send(res);
  };

  checkStatus = async (req: Request<CheckStatusCustomerInput["params"], {}, {}>, res: Response) => {
    const response = await CustomerService.checkStatus(+req.params.userId);
    return new OKResponse({
      message: "Xác thực thành công",
      metadata: response,
    }).send(res);
  };

  updateProfileMobile = async (
    req: Request<
      CustomerUpdateProfileMobileInput["params"],
      {},
      CustomerUpdateProfileMobileInput["body"]
    >,
    res: Response
  ) => {
    await CustomerService.updateProfile(+req.params.userId, req.body);
    return new OKResponse({
      message: "Cập nhật thành công. Giờ đây bạn có thể đăng nhập",
      metadata: {},
    }).send(res);
  };

  getAll = async (req: Request<{}, {}, {}>, res: Response) => {
    const { filters, options } = handleFilterQuery(req);
    const response = await CustomerService.getAll(filters, options);
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

  getById = async (req: Request<CustomerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await CustomerService.getById(+id);
    return new OKResponse({
      message: `Lấy dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  update = async (
    req: Request<CustomerInputUpdate["params"], {}, CustomerInputUpdate["body"]>,
    res: Response
  ) => {
    const id = req.params.id;
    // const response = await CustomerService.update(req.body, +id);
    return new OKResponse({
      message: `Cập nhật dữ liệu theo id = ${id} thành công.`,
      metadata: "",
    }).send(res);
  };

  delete = async (req: Request<CustomerInputUpdate["params"], {}, {}>, res: Response) => {
    const id = req.params.id;
    const response = await CustomerService.deleteById(+id);
    return new OKResponse({
      message: `Xóa dữ liệu theo id = ${id} thành công.`,
      metadata: response,
    }).send(res);
  };

  logoutMobile = async (req: CommonRequest, res: Response) => {
    const tokenPair = req.tokenPair!;

    const response = await CustomerService.logout(tokenPair.id!);

    req.session.destroy((err) => {});

    return new OKResponse({
      message: `Đăng xuất thành công.`,
      metadata: response,
    }).send(res);
  };
}

export default new CustomerController();
