import { Templates, sendEmail, validateRealMail } from "@/helpers";
import { registerCommon } from "@/repositories";
import { CustomerInputCreate, EmployeeInputCreate, OwnerInputCreate } from "@/schema";
import {
  ApiKeyService,
  CustomerInfoService,
  CustomerService,
  CustomerTypeService,
  EmployeeInfoService,
  EmployeeService,
  OwnerInfoService,
  OwnerService,
  TokenPairService,
} from "@/services";
import { createTokenPair, generateApiKey, removeNullObj } from "@/utils";
import { env } from "config";
import { UserTypes } from "types";

class AuthModel {
  protected static registerCustomer = async (
    data: CustomerInputCreate & { ip_address: string }
  ) => {
    /**
     * 1. Check username.
     * 2. Check Email. Check realEmail
     * 3. Handler displayName. merger First Name, Last Name.
     * 4. Hash Password.
     * 5. Create User And User Info.
     * 6. Create API Key.
     * 7. Send Mail Confirm.
     * 8. Complete Return Results.
     */
    const [_, { displayName, securePassword }, customerType] = await Promise.all([
      validateRealMail(data.email),
      registerCommon("customer", data),
      CustomerTypeService.findOne({ is_default: 1 }),
    ]);

    let customerTypeId = 1; // default 1 <=> Customer normal

    if (customerType) {
      customerTypeId = customerType.id!;
    }

    const userId = await CustomerService.create({
      email: data.email,
      username: data.username,
      password: securePassword,
      customer_type_id: customerTypeId,
      display_name: displayName,
      phone_number: data.phone_number,
    });

    const URL = `${env.CLIENT_ORIGIN_WEB}/account/customer/verify/${userId}`;

    const arrayPromise = await Promise.all([
      CustomerInfoService.create({
        customer_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender ? data.gender : "MALE",
      }),
      ApiKeyService.create({
        ip_address: data.ip_address,
        customer_id: userId,
      }),
      CustomerService.getById(userId),
      sendEmail({
        html: Templates.verifyAccount({ displayName, url: URL }),
        subject: "Xác thực tài khoản",
        to: data.email,
      }),
    ]);

    return arrayPromise[2];
  };

  protected static registerEmployee = async (
    data: EmployeeInputCreate & { ip_address: string }
  ) => {
    /**
     * 1. Check username and email.
     * 2. Check realEmail
     * 3. Handler displayName. merger First Name, Last Name.
     * 4. Hash Password.
     * 5. Create User And User Info.
     * 6. Create API Key.
     * 7. Complete Return Results.
     */

    const [_, { displayName, securePassword }] = await Promise.all([
      validateRealMail(data.email),
      registerCommon("employee", data),
    ]);

    const userId = await EmployeeService.create({
      email: data.email,
      username: data.username,
      password: securePassword,
      display_name: displayName,
      phone_number: data.phone_number,
    });

    const URL = `${env.CLIENT_ORIGIN_WEB}/account/employee/verify/${userId}`;

    const arrayPromise = await Promise.all([
      EmployeeInfoService.create({
        employee_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender ? data.gender : "MALE",
      }),
      ApiKeyService.create({
        ip_address: data.ip_address,
        employee_id: userId,
        permissions: "1111",
      }),
      EmployeeService.getById(userId),
      sendEmail({
        html: Templates.verifyAccount({ displayName, url: URL }),
        subject: "Xác thực tài khoản",
        to: data.email,
      }),
    ]);

    return arrayPromise[2];
  };

  protected static registerOwner = async (data: OwnerInputCreate & { ip_address: string }) => {
    /**
     * 1. Check username and email.
     * 2. Check realEmail
     * 3. Handler displayName. merger First Name, Last Name.
     * 4. Hash Password.
     * 5. Create User And User Info.
     * 6. Create API Key.
     * 7. Complete Return Results.
     */

    const [_, { displayName, securePassword }] = await Promise.all([
      validateRealMail(data.email),
      registerCommon("owner", data),
    ]);

    const userId = await OwnerService.create({
      email: data.email,
      username: data.username,
      password: securePassword,
      display_name: displayName,
      phone_number: data.phone_number,
    });

    const URL = `${env.CLIENT_ORIGIN_WEB}/account/owner/verify/${userId}`;

    const arrayPromise = await Promise.all([
      OwnerInfoService.create({
        owner_id: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        gender: data.gender ? data.gender : "MALE",
      }),
      ApiKeyService.create({
        ip_address: data.ip_address,
        owner_id: userId,
        permissions: "2222",
      }),
      OwnerService.getById(userId),
      sendEmail({
        html: Templates.verifyAccount({ displayName, url: URL }),
        subject: "Xác thực tài khoản",
        to: data.email,
      }),
    ]);

    return arrayPromise[2];
  };

  protected static generateKeyPairSync = async (id: number, type: UserTypes) => {
    const privateKey = generateApiKey();
    const publicKey = generateApiKey();
    const tokens = createTokenPair({ payload: { id }, privateKey, publicKey });
    let conditions = removeNullObj({
      customer_id: type === "customer" ? id : null,
      owner_id: type === "owner" ? id : null,
      employee_id: type === "employee" ? id : null,
    });

    const [findTokenPair, apiKey] = await Promise.all([
      TokenPairService.findOne(conditions),
      ApiKeyService.findOne(conditions),
    ]);

    if (findTokenPair) {
      await TokenPairService.update(
        {
          private_key: privateKey,
          public_key: publicKey,
          refresh_token: tokens.refreshToken,
          ...conditions,
        },
        findTokenPair.id!
      );
    } else {
      await TokenPairService.create({
        private_key: privateKey,
        public_key: publicKey,
        refresh_token: tokens.refreshToken,
        ...conditions,
      });
    }

    return { ...tokens, apiKey: apiKey ? apiKey : null };
  };
}

export default AuthModel;
