import compression from "compression";
import { env } from "config";
import Cookies from "cookie-parser";
import cors from "cors";
import Express, { Application, RequestHandler } from "express";
import helmet from "helmet";
import { Server } from "http";
import morgan from "morgan";
import path from "path";
import type { Server as SocketServer } from "socket.io";
import { SOCKET_KEY } from "./constants";
import { GenerateBillHelper } from "./helpers";
import SocketIOServer from "./helpers/socket.io.helper";
import { AppMiddleware } from "./middlewares";
import { router } from "./routes";
import CronService from "./services/Cron.service";
import { logger } from "./utils";

class App extends AppMiddleware {
  private app: Application;
  private httpServer: Server | null;
  private port: number;
  private socketIO: SocketIOServer;
  private socketServer: SocketServer;

  constructor(port: number) {
    super();
    this.socketIO = new SocketIOServer();

    this.httpServer = null;
    this.port = port;
    this.app = Express();

    // MomoService.collectionLink();
    // MomoService.refund({ orderId: "MOMO3014025603", transId: 3135254192 });
    (async () => {
      await GenerateBillHelper.generate();
      // await MomoService.confirmPayment("MOMO7483142943");
      // const response = await ZaloPayService.queryStatus("231204_617487");
      // console.log("====================================");
      // console.log(`query status  => `, response);
      // console.log("====================================");
      // 231204000002849
      // await ZaloPayService.refund({
      //   amount: 50000,
      //   description: "ZaloPay Refund Demo",
      //   zpTransId: "231204000002849",
      // });
    })();

    const session = this.expressSession(this.app);

    this.middleware(session);
    this.publicStatic();
    this.handler();
    this.routes();
    this.catchError();
    this.socketServer = this.setSocket(session);
  }

  private middleware(session: RequestHandler) {
    this.app.use(cors(this.cors([env.CLIENT_ORIGIN_WEB, "https://test-payment.momo.vn"])));
    this.app.use(compression(this.compression()));
    this.app.use(Cookies());
    this.app.use(Express.json());
    this.app.use(Express.urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(morgan("dev", { stream: logger }));
    this.app.use(session);
  }

  private cronJob(socketIO: SocketServer) {
    new CronService(socketIO);
  }

  private routes() {
    this.app.use("/", router);
  }

  private publicStatic() {
    const dir = path.join(__dirname, "/public/pdf");
    console.log("====================================");
    console.log(`dir`, dir);
    console.log("====================================");
    this.app.use(Express.static(dir));
  }

  private handler() {
    this.app.set("trust proxy", 1);
  }

  private setSocket(session: RequestHandler) {
    const { httpServer, socketIO } = this.socketIO.run(this.app, session);
    this.httpServer = httpServer;
    this.app.set(SOCKET_KEY, socketIO);
    return socketIO;
  }

  private catchError() {
    this.app.use(this.catchError404Resource);
    this.app.use(this.catchErrorInterValServer);
  }

  public start() {
    if (this.httpServer) {
      const server = this.httpServer.listen(this.port, () => {
        logger.info(`server on http://localhost:${this.port}`);
        this.cronJob(this.socketServer);
      });

      process.on("SIGINT", () => {
        server.close(() => logger.info("Exits servers."));
      });

      return;
    }

    const server = this.app.listen(this.port, () => {
      logger.info(`server on http://localhost:${this.port}`);
      this.cronJob(this.socketServer);
    });

    process.on("SIGINT", () => {
      server.close(() => logger.info("Exits servers."));
    });
  }
}

export default App;
