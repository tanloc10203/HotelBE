import dayjs from "dayjs";
import fs from "fs";
import _, { Dictionary } from "lodash";
import path from "path";
import { FolderLog, TypeLogs, UserTypes } from "types";

export const customLog = (type: TypeLogs = "Default", ...args: any) => {
  switch (type) {
    case "BrightMagenta":
      console.log(`\x1b[95m${args}\x1b\n`);
      break;

    case "Cyan":
      console.log(`\x1b[36m${args}\x1b\n`);
      break;

    case "Danger":
      console.log(`\x1b[31m${args}\x1b\n`);
      break;

    case "Orange":
      console.log(`\x1b[91m${args}\x1b\n`);
      break;

    case "Success":
      console.log(`\x1b[32m${args}\x1b\n`);
      break;

    case "Yellow":
      console.log(`\x1b[93m${args}\x1b\n`);
      break;

    case "Blue":
      console.log(`\x1b[34m${args}\x1b\n`);
      break;

    default:
      console.log("\n" + args);
      break;
  }
};

export const customLogError = (...args: any) => {
  console.log(
    `\x1b[41m[ERROR]\x1b[0m \x1b[91m${dayjs().format("DD/MM/YYYY HH:mm:ss")}\x1b[0m `,
    ...args
  );
};

export function rootFolderLog(root: string) {
  const rootFolder = path.join(__dirname, "../" + root);
  if (!fs.existsSync(rootFolder)) fs.mkdirSync(rootFolder, { recursive: true });
  return rootFolder;
}

export function childFolderLog(folder: FolderLog, rootFolder: string) {
  const root = rootFolderLog(rootFolder);
  const folderLog = path.join(root + "/" + folder);
  if (!fs.existsSync(folderLog)) fs.mkdirSync(folderLog, { recursive: true });
  return folderLog;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const getInfoData = <T>(object: T, filed: Array<keyof T>) => {
  return _.pick(object, filed);
};

export const removeNullObj = <T>(obj: Dictionary<T>) => {
  return _.omitBy(obj, _.isNil || _.isUndefined);
};

export const getConditions = (id: string | number, type: UserTypes) =>
  removeNullObj({
    customer_id: type === "customer" ? +id : null,
    owner_id: type === "owner" ? +id : null,
    employee_id: type === "employee" ? +id : null,
  });

export const getKeyUserTypes = (type: UserTypes) =>
  type === "customer" ? "customer_id" : type === "employee" ? "employee_id" : "owner_id";

export const calcPriceWithTax = (price: number, tax: number) => price + price * tax;
