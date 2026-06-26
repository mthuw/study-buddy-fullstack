import { Router } from "express";
import { verifyOTP } from "../controllers/otp.controller.js";

const otpRouter = Router();

otpRouter.post("/verify-otp", verifyOTP);

export default otpRouter;
