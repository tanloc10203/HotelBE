import "dotenv/config";
import App from "@/app";
import { env } from "config";

const server = new App(env.APP_PORT);
server.start();
