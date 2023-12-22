import { AuthController, CustomerController } from "@/controllers";
import { authorizationMobile, validateResource } from "@/middlewares";
import {
  AddFromFrontDeskSchema,
  AuthChangePasswordSchema,
  CheckStatusCustomerSchema,
  CustomerCreateMobileSchema,
  CustomerResendCodeMobileSchema,
  CustomerUpdateProfileMobileSchema,
  CustomerUpdateSchema,
  CustomerVerifyCodeMobileSchema,
} from "@/schema";
import { asyncHandler } from "@/utils";
import { Router } from "express";

const route = Router();

route
  .route("/")
  .post(
    asyncHandler(validateResource(CustomerCreateMobileSchema)),
    asyncHandler(CustomerController.create)
  )
  .get(asyncHandler(CustomerController.getAll));

route.post(
  "/AddFromFrontDesk",
  asyncHandler(validateResource(AddFromFrontDeskSchema)),
  asyncHandler(CustomerController.addFromFrontDesk)
);

route.post(
  "/VerifyCode",
  asyncHandler(validateResource(CustomerVerifyCodeMobileSchema)),
  asyncHandler(CustomerController.verifyCode)
);

route.post(
  "/ResendCode",
  asyncHandler(validateResource(CustomerResendCodeMobileSchema)),
  asyncHandler(CustomerController.resendCode)
);

route.post(
  "/LoginWithPhoneNumber",
  asyncHandler(validateResource(CustomerCreateMobileSchema)),
  asyncHandler(CustomerController.loginWithPhoneNumber)
);

route.post(
  "/UpdateProfile/:userId",
  asyncHandler(validateResource(CustomerUpdateProfileMobileSchema)),
  asyncHandler(CustomerController.updateProfileMobile)
);

route.post(
  "/RefreshToken",
  asyncHandler(authorizationMobile),
  asyncHandler(CustomerController.refreshTokenMobile)
);

route.get(
  "/CheckStatus/:userId",
  asyncHandler(validateResource(CheckStatusCustomerSchema)),
  asyncHandler(CustomerController.checkStatus)
);

route.patch(
  "/Password/Change",
  [asyncHandler(authorizationMobile), asyncHandler(validateResource(AuthChangePasswordSchema))],
  asyncHandler(AuthController.changePasswordForCustomer)
);

route
  .route("/Profile")
  .get(asyncHandler(authorizationMobile), asyncHandler(CustomerController.getProfileMobile));

route.patch(
  "/Profile/:id",
  [asyncHandler(validateResource(CustomerUpdateSchema)), asyncHandler(authorizationMobile)],
  asyncHandler(AuthController.updateProfileCustomer)
);

route.post(
  "/LogoutMobile",
  asyncHandler(authorizationMobile),
  asyncHandler(CustomerController.logoutMobile)
);

route
  .route("/:id")
  .patch(
    asyncHandler(validateResource(CustomerUpdateSchema)),
    asyncHandler(CustomerController.update)
  )
  .delete(asyncHandler(CustomerController.delete))
  .get(asyncHandler(CustomerController.getById));

export default route;
