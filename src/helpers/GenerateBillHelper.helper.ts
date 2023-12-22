import { rootFolderLog } from "@/utils";
import puppeteer from "puppeteer";
import { templateBill } from "./templateBill";

class GenerateBillHelper {
  public static generate = async () => {
    const html = templateBill();

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
    });

    const folder = rootFolderLog("/public/pdf");

    const pdfBuffer = await page.pdf({
      path: folder + "/test.pdf",
      width: 450,
      height: 1000,
      printBackground: true,
    });

    return pdfBuffer;
  };
}

export default GenerateBillHelper;
