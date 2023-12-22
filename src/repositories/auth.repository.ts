import { ServicesAuth } from "@/constants";
import { ConflictRequestError, hashPassword } from "@/utils";
import { UserTypes } from "types";

export const registerCommon = async (type: UserTypes, data: any) => {
  const Service = ServicesAuth["Index"][type]();
  const [usernameExist, EmailExist] = await Promise.all([
    Service.findOne({ username: data.username }),
    Service.findOne({ email: data.email }),
  ]);

  if (usernameExist || EmailExist) {
    throw new ConflictRequestError("Email hoặc tài khoản đã tồn tại.");
  }

  const displayName = `${data.last_name} ${data.first_name}`;
  const securePassword = await hashPassword(data.password);

  return { displayName, securePassword };
};
