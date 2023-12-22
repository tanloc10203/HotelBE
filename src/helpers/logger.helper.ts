import { LogService } from "@/services";
import { childFolderLog } from "@/utils";
import { env } from "config";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import { LogEventParams } from "types";

const RootLog = env.FOLDER_ROOT_LOG;

async function logEvents({ message, type }: LogEventParams) {
  try {
    const folder = childFolderLog(type, RootLog);

    const format = dayjs().format("DD-MM-YYYY");
    const datetime = `[${dayjs().format("HH:mm:ss")}]`;

    const filename = path.join(folder, `${format}.log`);
    const contentLog = `${datetime} ${message}`;

    const response = await LogService.findLogByFilename(format, type);

    if (!response) {
      await LogService.create({ filename: format, log_type: type });
    }

    await fs.promises.appendFile(filename, contentLog, { encoding: "utf-8" });
  } catch (error) {
    console.log(`error logEvents`, error);
  }
}

export default logEvents;
