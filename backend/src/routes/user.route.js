import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  currentUser,
} from "../controllers/user.controller.js";
import { userAuth } from "../middleware/user.auth.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", userAuth, logoutUser);
userRouter.get("/me", userAuth, currentUser);
export default userRouter;
