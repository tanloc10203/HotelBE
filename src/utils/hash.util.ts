import bcrypt from "bcrypt";
import crypto from "node:crypto";
import JWT from "jsonwebtoken";
import { GenerateJWT, GenerateTokenPairProps } from "types";
import { env } from "config";
import otpGenerate from "otp-generator";
import moment from "moment";

export const generateOtp = (length?: number, isText = false) => {
  return otpGenerate.generate(length ?? 6, {
    digits: isText ? false : true,
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: isText,
  });
};

/**
 * @description return character with length equal 10
 * @returns
 */
export const generateUUID = (prefix?: string) => {
  const date = moment().format("HHmmss");
  return `${prefix}${generateOtp(2, true)}${date}${generateOtp(2, true)}`;
};

/**
 * @description return character with length default 10 + prefixLength auto
 * @returns
 */
export const generateUUIDv2 = (prefix: string) => {
  const date = moment().format("HHmmss");
  return `${prefix}${generateOtp(4)}${date}`;
};

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const generateApiKey = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const generateJWT = <T extends object>({
  payload,
  secureKey,
  expiresIn,
}: GenerateJWT<T>) => {
  expiresIn = expiresIn ?? env.EXPIRES_IN_RESET_PASSWORD;
  return JWT.sign(payload, secureKey, { expiresIn: expiresIn });
};

export const createTokenPair = <T extends object>({
  payload,
  expiresInPrivateKey,
  expiresInPublicKey,
  privateKey,
  publicKey,
}: GenerateTokenPairProps<T>) => {
  expiresInPrivateKey = env.EXPIRES_IN_PRIVATE_KEY;
  expiresInPublicKey = env.EXPIRES_IN_PUBLIC_KEY;

  const accessToken = JWT.sign(payload, publicKey, { expiresIn: expiresInPublicKey });
  const refreshToken = JWT.sign(payload, privateKey, { expiresIn: expiresInPrivateKey });
  return { accessToken, refreshToken };
};

export const generateTokenOTP = (secureKey: string, expiresIn: string | undefined, length = 16) => {
  const TOKEN = generateOtp(length);
  const hashToken = generateJWT({
    payload: { token: TOKEN },
    secureKey: secureKey,
    expiresIn,
  });
  return { TOKEN, hashToken };
};

export const encodeBase64 = (value: any) => Buffer.from(JSON.stringify(value)).toString("base64");
export const decodeBase64 = (encode: string) => Buffer.from(encode, "base64").toString("ascii");
