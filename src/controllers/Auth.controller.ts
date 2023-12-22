import { COOKIE_OPTIONS, CookieHeaders } from "@/constants";
import {
  AuthChangePasswordInput,
  AuthForgotPasswordInput,
  AuthLoginInputCreate,
  AuthResetPasswordParams,
  AuthVerifyAccountParams,
  CustomerInputCreate,
  CustomerInputUpdate,
  EmployeeInputCreate,
  OwnerInputCreate,
} from "@/schema";
import { AuthService } from "@/services";
import { CreatedResponse, ForbiddenRequestError, OKResponse } from "@/utils";
import { Request, Response } from "express";
import { CommonRequest } from "types";

class AuthController {
  registerForCustomer = async (req: Request<{}, {}, CustomerInputCreate>, res: Response) => {
    const response = await AuthService.register({
      type: "customer",
      data: req.body,
      ip_address: req.ip,
    });
    return new CreatedResponse({
      message: "Đăng ký tài khoản thành công. Vui lòng kiểm tra email xác thực tài khoản.",
      metadata: {},
    }).send(res);
  };

  registerForEmployee = async (req: Request<{}, {}, EmployeeInputCreate>, res: Response) => {
    const response = await AuthService.register({
      type: "employee",
      data: req.body,
      ip_address: req.ip,
    });
    return new CreatedResponse({
      message: "Đăng ký tài khoản thành công. Vui lòng kiểm tra email xác thực tài khoản.",
      metadata: {},
    }).send(res);
  };

  registerForOwner = async (req: Request<{}, {}, OwnerInputCreate>, res: Response) => {
    const response = await AuthService.register({
      type: "owner",
      data: req.body,
      ip_address: req.ip,
    });
    return new CreatedResponse({
      message: "Đăng ký tài khoản thành công. Vui lòng kiểm tra email xác thực tài khoản.",
      metadata: {},
    }).send(res);
  };

  loginForCustomer = async (req: Request<{}, {}, AuthLoginInputCreate>, res: Response) => {
    const response = await AuthService.login({
      type: "customer",
      data: req.body,
    });

    const { tokens, user } = response;

    res.cookie(CookieHeaders.REFRESH_TOKEN_CUSTOMER, tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_CLIENT_ID_CUSTOMER, user.id, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_API_KEY_CUSTOMER, tokens.apiKey?.key, COOKIE_OPTIONS);

    return new OKResponse({
      message: "Đăng nhập thành công.",
      metadata: response.tokens.accessToken,
    }).send(res);
  };

  loginForEmployee = async (req: Request<{}, {}, AuthLoginInputCreate>, res: Response) => {
    const response = await AuthService.login({
      type: "employee",
      data: req.body,
    });

    const { tokens, user } = response;

    res.cookie(CookieHeaders.REFRESH_TOKEN_EMPLOYEE, tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_CLIENT_ID_EMPLOYEE, user.id, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_API_KEY_EMPLOYEE, tokens.apiKey?.key, COOKIE_OPTIONS);

    return new OKResponse({
      message: "Đăng nhập thành công.",
      metadata: response.tokens.accessToken,
    }).send(res);
  };

  loginForOwner = async (req: Request<{}, {}, AuthLoginInputCreate>, res: Response) => {
    const response = await AuthService.login({
      type: "owner",
      data: req.body,
    });

    const { tokens, user } = response;

    res.cookie(CookieHeaders.REFRESH_TOKEN_OWNER, tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_CLIENT_ID_OWNER, user.id, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_API_KEY_OWNER, tokens.apiKey?.key, COOKIE_OPTIONS);

    return new OKResponse({
      message: "Đăng nhập thành công.",
      metadata: response.tokens.accessToken,
    }).send(res);
  };

  refreshTokenForCustomer = async (
    req: CommonRequest<{}, {}, AuthLoginInputCreate>,
    res: Response
  ) => {
    const response = await AuthService.refreshToken({
      type: "customer",
      refreshToken: req.refreshToken!,
      tokenPair: req.tokenPair!,
      userId: +req.userId!,
    });

    const { tokens, user } = response;

    res.cookie(CookieHeaders.REFRESH_TOKEN_CUSTOMER, tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_CLIENT_ID_CUSTOMER, user.id, COOKIE_OPTIONS);

    return new OKResponse({
      message: "RefreshToken thành công.",
      metadata: response.tokens.accessToken,
    }).send(res);
  };

  refreshTokenForEmployee = async (
    req: CommonRequest<{}, {}, AuthLoginInputCreate>,
    res: Response
  ) => {
    const response = await AuthService.refreshToken({
      type: "employee",
      refreshToken: req.refreshToken!,
      tokenPair: req.tokenPair!,
      userId: +req.userId!,
    });

    const { tokens, user } = response;

    res.cookie(CookieHeaders.REFRESH_TOKEN_EMPLOYEE, tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_CLIENT_ID_EMPLOYEE, user.id, COOKIE_OPTIONS);

    return new OKResponse({
      message: "RefreshToken thành công.",
      metadata: response.tokens,
    }).send(res);
  };

  refreshTokenForOwner = async (
    req: CommonRequest<{}, {}, AuthLoginInputCreate>,
    res: Response
  ) => {
    const response = await AuthService.refreshToken({
      type: "owner",
      refreshToken: req.refreshToken!,
      tokenPair: req.tokenPair!,
      userId: +req.userId!,
    });

    const { tokens, user } = response;

    res.cookie(CookieHeaders.REFRESH_TOKEN_OWNER, tokens.refreshToken, COOKIE_OPTIONS);
    res.cookie(CookieHeaders.X_CLIENT_ID_OWNER, user.id, COOKIE_OPTIONS);

    return new OKResponse({
      message: "RefreshToken thành công.",
      metadata: response.tokens,
    }).send(res);
  };

  profileForCustomer = async (req: CommonRequest<{}, {}, AuthLoginInputCreate>, res: Response) => {
    const response = await AuthService.profile({
      type: "customer",
      userId: +req.userId!,
    });

    return new OKResponse({
      message: "Thay đổi mật khẩu thành công.",
      metadata: response,
    }).send(res);
  };

  profileForEmployee = async (req: CommonRequest<{}, {}, AuthLoginInputCreate>, res: Response) => {
    const response = await AuthService.profile({
      type: "employee",
      userId: +req.userId!,
    });

    return new OKResponse({
      message: "Lấy dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  profileForOwner = async (req: CommonRequest<{}, {}, AuthLoginInputCreate>, res: Response) => {
    const response = await AuthService.profile({
      type: "owner",
      userId: +req.userId!,
    });

    return new OKResponse({
      message: "Lấy dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  updateProfileCustomer = async (
    req: CommonRequest<CustomerInputUpdate["params"], {}, CustomerInputUpdate["body"]>,
    res: Response
  ) => {
    if (+req.userId! !== +req.params.id) {
      throw new ForbiddenRequestError(`Bạn không được phép thực hiện`);
    }

    const response = await AuthService.updateProfile({
      type: "customer",
      userId: +req.userId!,
      data: req.body,
    });

    return new OKResponse({
      message: "Cập nhật dữ liệu khách hàng thành công.",
      metadata: response,
    }).send(res);
  };

  updateProfileEmployee = async (
    req: CommonRequest<CustomerInputUpdate["params"], {}, CustomerInputUpdate["body"]>,
    res: Response
  ) => {
    if (+req.userId! !== +req.params.id) {
      throw new ForbiddenRequestError(`Bạn không được phép thực hiện`);
    }

    const response = await AuthService.updateProfile({
      type: "employee",
      userId: +req.userId!,
      data: req.body,
    });

    return new OKResponse({
      message: "Cập nhật dữ liệu nhân viên thành công.",
      metadata: response,
    }).send(res);
  };

  updateProfileOwner = async (
    req: CommonRequest<CustomerInputUpdate["params"], {}, CustomerInputUpdate["body"]>,
    res: Response
  ) => {
    if (+req.userId! !== +req.params.id) {
      throw new ForbiddenRequestError(`Bạn không được phép thực hiện`);
    }

    const response = await AuthService.updateProfile({
      type: "owner",
      userId: +req.userId!,
      data: req.body,
    });

    return new OKResponse({
      message: "Cập nhật dữ liệu chủ sở hửu thành công.",
      metadata: response,
    }).send(res);
  };

  updatePhotoCustomer = async (
    req: CommonRequest<CustomerInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    if (+req.userId! !== +req.params.id) {
      throw new ForbiddenRequestError(`Bạn không được phép thực hiện`);
    }

    const response = await AuthService.updatePhoto({
      type: "customer",
      userId: +req.userId!,
      imageId: req.imageId as string,
    });

    return new OKResponse({
      message: "Cập nhật ảnh đại diện thành công.",
      metadata: response,
    }).send(res);
  };

  updatePhotoEmployee = async (
    req: CommonRequest<CustomerInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    if (+req.userId! !== +req.params.id) {
      throw new ForbiddenRequestError(`Bạn không được phép thực hiện`);
    }

    const response = await AuthService.updatePhoto({
      type: "employee",
      userId: +req.userId!,
      imageId: req.imageId as string,
    });

    return new OKResponse({
      message: "Cập nhật ảnh đại diện thành công.",
      metadata: response,
    }).send(res);
  };

  updatePhotoOwner = async (
    req: CommonRequest<CustomerInputUpdate["params"], {}, {}>,
    res: Response
  ) => {
    if (+req.userId! !== +req.params.id) {
      throw new ForbiddenRequestError(`Bạn không được phép thực hiện`);
    }

    const response = await AuthService.updatePhoto({
      type: "owner",
      userId: +req.userId!,
      imageId: req.imageId as string,
    });

    return new OKResponse({
      message: "Cập nhật ảnh đại diện thành công.",
      metadata: response,
    }).send(res);
  };

  changePasswordForCustomer = async (
    req: CommonRequest<{}, {}, AuthChangePasswordInput>,
    res: Response
  ) => {
    const response = await AuthService.changePassword({
      type: "customer",
      userId: +req.userId!,
      ...req.body,
    });

    return new OKResponse({
      message: "Lấy dữ liệu thành công.",
      metadata: response,
    }).send(res);
  };

  changePasswordForEmployee = async (
    req: CommonRequest<{}, {}, AuthChangePasswordInput>,
    res: Response
  ) => {
    const response = await AuthService.changePassword({
      type: "employee",
      userId: +req.userId!,
      ...req.body,
    });

    return new OKResponse({
      message: "Thay đổi mật khẩu thành công.",
      metadata: response,
    }).send(res);
  };

  changePasswordForOwner = async (
    req: CommonRequest<{}, {}, AuthChangePasswordInput>,
    res: Response
  ) => {
    const response = await AuthService.changePassword({
      type: "owner",
      userId: +req.userId!,
      ...req.body,
    });

    return new OKResponse({
      message: "Thay đổi mật khẩu thành công.",
      metadata: response,
    }).send(res);
  };

  forgotPasswordForCustomer = async (
    req: Request<{}, {}, AuthForgotPasswordInput>,
    res: Response
  ) => {
    const response = await AuthService.forgotPassword({
      type: "customer",
      data: req.body,
    });

    return new OKResponse({
      message: "Vui lòng kiểm tra email để có thể thay đổi mật khẩu.",
      metadata: response,
    }).send(res);
  };

  forgotPasswordForEmployee = async (
    req: Request<{}, {}, AuthForgotPasswordInput>,
    res: Response
  ) => {
    const response = await AuthService.forgotPassword({
      type: "employee",
      data: req.body,
    });

    return new OKResponse({
      message: "Vui lòng kiểm tra email để có thể thay đổi mật khẩu.",
      metadata: response,
    }).send(res);
  };

  forgotPasswordForOwner = async (req: Request<{}, {}, AuthForgotPasswordInput>, res: Response) => {
    const response = await AuthService.forgotPassword({
      type: "owner",
      data: req.body,
    });

    return new OKResponse({
      message: "Vui lòng kiểm tra email để có thể thay đổi mật khẩu.",
      metadata: response,
    }).send(res);
  };

  resetPasswordForCustomer = async (
    req: Request<AuthResetPasswordParams["params"], {}, AuthResetPasswordParams["body"]>,
    res: Response
  ) => {
    const response = await AuthService.resetPassword({
      type: "customer",
      token: req.params.token,
      userId: +req.params.id,
      data: req.body,
    });

    return new OKResponse({
      message: "Thay đổi mật khẩu thành công. Bạn đã có thể đăng nhập với mật khẩu mới.",
      metadata: response,
    }).send(res);
  };

  resetPasswordForEmployee = async (
    req: Request<AuthResetPasswordParams["params"], {}, AuthResetPasswordParams["body"]>,
    res: Response
  ) => {
    const response = await AuthService.resetPassword({
      type: "employee",
      token: req.params.token,
      userId: +req.params.id,
      data: req.body,
    });

    return new OKResponse({
      message: "Thay đổi mật khẩu thành công. Bạn đã có thể đăng nhập với mật khẩu mới.",
      metadata: response,
    }).send(res);
  };

  resetPasswordForOwner = async (
    req: Request<AuthResetPasswordParams["params"], {}, AuthResetPasswordParams["body"]>,
    res: Response
  ) => {
    const response = await AuthService.resetPassword({
      type: "owner",
      token: req.params.token,
      userId: +req.params.id,
      data: req.body,
    });

    return new OKResponse({
      message: "Thay đổi mật khẩu thành công. Bạn đã có thể đăng nhập với mật khẩu mới.",
      metadata: response,
    }).send(res);
  };

  verifyAccountForCustomer = async (
    req: Request<AuthVerifyAccountParams, {}, {}>,
    res: Response
  ) => {
    const response = await AuthService.verifyAccount({
      type: "customer",
      userId: +req.params.id,
    });

    return new OKResponse({
      message: "Xác thực tài khoản thành công. Bạn có thể thực hiện các tác vụ",
      metadata: {},
    }).send(res);
  };

  verifyAccountForEmployee = async (
    req: Request<AuthVerifyAccountParams, {}, {}>,
    res: Response
  ) => {
    const response = await AuthService.verifyAccount({
      type: "employee",
      userId: +req.params.id,
    });

    return new OKResponse({
      message: "Xác thực tài khoản thành công. Bạn có thể thực hiện các tác vụ",
      metadata: {},
    }).send(res);
  };

  verifyAccountForOwner = async (req: Request<AuthVerifyAccountParams, {}, {}>, res: Response) => {
    const response = await AuthService.verifyAccount({
      type: "owner",
      userId: +req.params.id,
    });

    return new OKResponse({
      message: "Xác thực tài khoản thành công. Bạn có thể thực hiện các tác vụ",
      metadata: {},
    }).send(res);
  };

  logoutForCustomer = async (req: CommonRequest, res: Response) => {
    await AuthService.logout(req.tokenPair!.id!);

    res.clearCookie(CookieHeaders.REFRESH_TOKEN_CUSTOMER);
    res.clearCookie(CookieHeaders.X_API_KEY_CUSTOMER);
    res.clearCookie(CookieHeaders.X_CLIENT_ID_CUSTOMER);

    return new OKResponse({
      message: "Đăng xuất thành công",
      metadata: {},
    }).send(res);
  };

  logoutForEmployee = async (req: CommonRequest, res: Response) => {
    await AuthService.logout(req.tokenPair!.id!);

    res.clearCookie(CookieHeaders.REFRESH_TOKEN_EMPLOYEE);
    res.clearCookie(CookieHeaders.X_API_KEY_EMPLOYEE);
    res.clearCookie(CookieHeaders.X_CLIENT_ID_EMPLOYEE);

    return new OKResponse({
      message: "Đăng xuất thành công",
      metadata: {},
    }).send(res);
  };

  logoutForOwner = async (req: CommonRequest, res: Response) => {
    await AuthService.logout(req.tokenPair!.id!);

    res.clearCookie(CookieHeaders.REFRESH_TOKEN_OWNER);
    res.clearCookie(CookieHeaders.X_API_KEY_OWNER);
    res.clearCookie(CookieHeaders.X_CLIENT_ID_OWNER);

    return new OKResponse({
      message: "Đăng xuất thành công",
      metadata: {},
    }).send(res);
  };
}

export default new AuthController();
