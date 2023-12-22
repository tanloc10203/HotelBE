import { Router } from "express";
import routeLogin from "./AuthLogin.route";
import routeRegister from "./AuthRegister.route";
import routeProfile from "./AuthProfile.route";
import routeRefreshToken from "./AuthToken.route";
import routePassword from "./AuthPassword.route";
import routeVerify from "./AuthVerify.route";
import routeLogout from "./AuthLogout.route";

const route = Router();

route.use("/Register", routeRegister);
route.use("/Login", routeLogin);
route.use("/Profile", routeProfile);
route.use("/RefreshToken", routeRefreshToken);
route.use("/Password", routePassword);
route.use("/Verify", routeVerify);
route.use("/Logout", routeLogout);

export default route;
