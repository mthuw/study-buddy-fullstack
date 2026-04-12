import { Router } from "express";
import {
  adminLogin,
  getAllUsers,
  adminLogout,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller.js";
import { adminAuth } from "../middleware/admin.auth.js";
import { registerUser } from "../controllers/user.controller.js";

const adminRouter = Router();
adminRouter.post("/adminLogin", adminLogin);
adminRouter.post("/adminLogout", adminAuth, adminLogout);
adminRouter.get("/users", adminAuth, getAllUsers);
adminRouter.put("/users/:id", adminAuth, updateUser);
adminRouter.post("/addUser", adminAuth, registerUser);
adminRouter.delete("/deleteUser/:id", adminAuth, deleteUser);
export default adminRouter;
