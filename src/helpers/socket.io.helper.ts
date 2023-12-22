import { SOCKET_KEY, SocketEventsName } from "@/constants";
import { MomoPaymentResponse, ResponsePayment } from "@/models";
import { SocketService } from "@/services";
import { SavePushTokenExpoPayload } from "@/services/Socket.service";
import { env } from "config";
import { Application, Request, RequestHandler } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CommonRequest } from "types";
import { SessionSocket } from "types/global";

export type SocketIO = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export type ServiceIO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

class SocketIOServer extends SocketService {
  private static PUSH_EXPO_TOKEN = "PUSH_EXPO_TOKEN";

  private wrap = (eMD: any) => (socket: Socket, next: (err?: ExtendedError) => void) =>
    eMD(socket.request, {}, next);

  public authMiddleware = (socket: SocketIO, next: (err?: ExtendedError) => void) => {
    const type: undefined | "admin" = socket.handshake?.query?.type as undefined | "admin";

    console.log(`⚡ new connected with socketId : ${socket.id}!`);
    console.log(`⚡ new connected with query :!`, socket.handshake.query.type);

    if (type && type === "admin") {
      return next();
    }

    // @ts-ignore
    const session = socket.request?.session?.userId;

    const userId = socket.handshake.auth?.userId;

    console.log("====================================");
    console.log({ userId, session });
    console.log("====================================");

    if (!session && !userId) return next(new Error("Authentication error"));

    // @ts-ignore
    socket.userId = userId || session;

    next();
  };

  public run(app: Application, sessionMiddleware: RequestHandler) {
    const httpServer = createServer(app);

    const socketIO = new Server(httpServer, {
      cors: {
        origin: env.CLIENT_ORIGIN_MOBILE,
        credentials: true,
        methods: ["GET", "POST"],
      },
    });

    socketIO.use(this.wrap(sessionMiddleware));
    socketIO.use(this.authMiddleware);
    // auth middleware

    const io = socketIO.on("connect", (defaultSocket: Socket) => {
      const socket = <SessionSocket>defaultSocket;

      io.socketsJoin(`${socket.userId}`);

      this.joinServer(socket);

      const userId = socket.request?.session?.userId || socket.userId;

      console.log(`⚡ new connected with userId : ${userId}!`);

      socket.on(
        SocketIOServer.PUSH_EXPO_TOKEN,
        async ({ expoPushToken, userId }: SavePushTokenExpoPayload) => {
          await this.savePushTokenExpo({ expoPushToken, userId }, socket);
        }
      );

      socket.on(
        SocketEventsName.REQUEST_COUNT_NOTIFICATION,
        async ({ userId }: { userId: number }) => {
          await this.getCountNotification(io, userId);
        }
      );

      // socket.on(SocketEventsName.REQUEST_PAYMENT_RESPONSE, async (payload: MomoPaymentResponse) => {
      //   await this.responsePayment(payload, io);
      // });

      socket.on(SocketEventsName.REQUEST_PAYMENT_RESPONSE, async (payload: ResponsePayment) => {
        await this.responsePaymentZaloPay(payload, io);
      });

      socket.on("disconnect", () => {
        socket.disconnect();
        io.socketsLeave(`${socket.userId}`);
        socket.leave(socket.request.session?.userId || socket.handshake.auth?.userId);
        console.log(`🔥: A user disconnected ${socket.handshake.auth?.userId}`);
      });
    });

    return { socketIO, httpServer };
  }

  public static getSocketServer(req: CommonRequest | Request) {
    return req.app.get(SOCKET_KEY) as Server;
  }
}

export default SocketIOServer;
