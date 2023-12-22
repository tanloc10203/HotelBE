import { TokenPair } from "@/models";
import {
  AuthForgotPasswordInput,
  AuthResetPasswordParams,
  CustomerInputCreate,
  CustomerInputUpdate,
  EmployeeInputCreate,
  OwnerInputCreate,
} from "@/schema";

type CustomerRegisterState = { type: "customer"; data: CustomerInputCreate };
type EmployeeRegisterState = { type: "employee"; data: EmployeeInputCreate };
type OwnerRegisterState = { type: "owner"; data: OwnerInputCreate };

export type RegisterProps = CustomerRegisterState | EmployeeRegisterState | OwnerRegisterState;
export type UserTypes = "customer" | "employee" | "owner";
export type LoginProps = {
  type: UserTypes;
  data: { username: string; password: string };
};

export type GenerateTokenPairProps<Payload extends object> = {
  payload: Payload;
  /** @description for accessToken */
  publicKey: string;
  /** @description for refreshToken */
  privateKey: string;
  /** @description expiresIn for accessToken */
  expiresInPublicKey?: string | number;
  /** @description expiresIn for refreshToken */
  expiresInPrivateKey?: string | number;
};

export type GenerateJWT<Payload extends object> = {
  payload: Payload;
  secureKey: string;
  expiresIn?: string | number;
};

export interface RefreshTokenProps {
  type: UserTypes;
  refreshToken: string;
  userId: number;
  tokenPair: TokenPair;
}

export interface GetProfileProps {
  type: UserTypes;
  userId: number;
}

export interface ForgotPasswordProps {
  data: AuthForgotPasswordInput;
  type: UserTypes;
}

export type AuthChangeProfile = {
  data: CustomerInputUpdate["body"];
} & GetProfileProps;

export type ResetPasswordProps = {
  type: UserTypes;
  data: AuthResetPasswordParams["body"];
  token: string;
  userId: number;
};

export type UpdatePhotoProps = {
  type: UserTypes;
  userId: number;
  imageId: string;
};
