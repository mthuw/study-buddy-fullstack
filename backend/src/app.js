import express from "express";
import cors from "cors";
import session from "express-session";
import userRouter from "./routes/user.route.js";
import postRouter from "./routes/post.route.js";
import profileRouter from "./routes/profile.route.js";
import adminRouter from "./routes/admin.route.js";
import otpRouter from "./routes/otp.route.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);
app.use("/api/users", userRouter);
app.use("/api/auth", otpRouter);
app.use("/api/posts", postRouter);
app.use("/api/profilePost", profileRouter);
app.use("/api/admin", adminRouter);
export default app;
