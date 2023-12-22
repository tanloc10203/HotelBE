import { BadRequestError } from "@/utils";
import axios from "axios";
import { env } from "config";
import validate from "deep-email-validator";
import { ElementType } from "deep-email-validator/dist/types";
import nodemailer from "nodemailer";

declare const OrderedLevels: readonly ["regex", "typo", "disposable", "mx", "smtp"];

declare type Level = ElementType<typeof OrderedLevels>;

const URL = "https://emailvalidation.abstractapi.com/v1";

export type SendEmailProps = {
  to: string;
  html: string;
  subject: string;
  title?: string;
};

export const validateRealMail = (email: string, message?: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      message = message ?? "Vui lòng cung cấp địa chỉ email hợp lệ";

      const { valid, validators, reason } = await validate({ email: email, validateSMTP: true });

      if (!valid && reason && !validators[reason as Level]?.valid) {
        throw new BadRequestError(message);
      }

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};

export const validateRealMailV2 = (email: string, message?: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(URL, {
        params: {
          api_key: "a644980b946c4d178e904f2cc5a650ec",
          email: email,
        },
      });

      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });

export const sendEmail = async ({ html, subject, to, title }: SendEmailProps) =>
  new Promise(async (resolve, reject) => {
    try {
      title = env.EMAIL_TITLE ?? "Back End Dev";

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: "gmail",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: env.EMAIL_ADDRESS, // generated ethereal user
          pass: env.EMAIL_PASSWORD, // generated ethereal password
        },
      });

      await transporter.sendMail({
        from: title,
        to: to,
        subject: subject,
        html: html,
      });

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
