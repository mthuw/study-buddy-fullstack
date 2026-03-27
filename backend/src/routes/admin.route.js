import { Router } from "express";
import { adminLogin } from "../controllers/admin.controller.js";
import { adminLogout } from "../controllers/admin.controller.js";

const adminRouter = Router();
adminRouter.post("/adminLogin", adminLogin);
adminRouter.post("/adminLogout", adminLogout);

export default adminRouter;