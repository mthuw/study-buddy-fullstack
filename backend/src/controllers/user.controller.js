import { dbMySQL } from "../config/mysql.js";
import bcrypt from "bcrypt";
import { randomInt } from "crypto";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

export const registerUser = async (req, res) => {
  try {
    const { Email, UserName, Password, Avatar } = req.body;
    if (!Email || !UserName || !Password) {
      return res
        .status(400)
        .json({ error: "Email, UserName, and Password are required" });
    }
    if (Password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    if (!Email.includes("@")) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }

    const [existedUser] = await dbMySQL.query(
      "SELECT * FROM users WHERE Email=  ?",
      [Email],
    );
    if (existedUser.length > 0) {
      return res
        .status(409)
        .json({ error: "This email is already registered" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const insertUserQuery =
      "INSERT INTO users (Email, UserName, Password, Avatar) VALUES (?,?,?,?)";
    await dbMySQL.query(insertUserQuery, [
      Email,
      UserName,
      hashedPassword,
      Avatar ?? "avatar1",
    ]);

    const insertLoginQuery = "INSERT INTO Login (Email, Password) VALUES (?,?)";
    await dbMySQL.query(insertLoginQuery, [Email, hashedPassword]);

    return res.status(201).json({
      message: "User created successfully!",
      success: true,
      redirectTo: "http://localhost:5500/frontend/login.html",
    });
  } catch (error) {
    return res.status(500).json({ error: "Registration failed" });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const [rows] = await dbMySQL.query(
      "SELECT * FROM Login WHERE Email = ? LIMIT 1",
      [Email],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const hashedPassword = rows[0].Password;
    const success = await bcrypt.compare(Password, hashedPassword);
    if (!success) {
      return res.status(401).json({ error: "Password or Email not correct" });
    }
    const [users] = await dbMySQL.query(
      "SELECT UserID, UserName FROM users WHERE Email=  ? LIMIT 1",
      [Email],
    );
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found in users table" });
    }
    const otp = randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    req.session.pendingLogin = {
      UserID: users[0].UserID,
      UserName: users[0].UserName,
      Email,
      otpHash,
      otpExpiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      otpAttempts: 0,
    };
    console.log(`OTP for ${Email}: ${otp}`);
    const previewUrl = await sendOtpEmail(Email, otp);

    req.session.save((e) => {
      if (e) {
        console.error("Session save error:", e);
        return res.status(500).json({ error: "Session save failed" });
      }

      return res.status(200).json({
        message: "OTP required",
        success: true,
        otpRequired: true,
        redirectTo: "http://localhost:5500/frontend/otp.html",
        previewUrl,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Error login" });
  }
};
export const logoutUser = async (req, res) => {
  try {
    req.session.destroy((e) => {
      if (e) {
        return res.status(500).json({ error: "User logout failed" });
      }
    });
    res.clearCookie("connect.sid");
    console.log("Log out successful");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ error: "Error logout" });
  }
};

export const currentUser = async (req, res) => {
  try {
    if (!req.session || !req.session.UserID) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    return res.status(200).json({
      UserID: req.session.UserID,
      UserName: req.session.UserName,
    });
  } catch (error) {
    console.error("currentUser error:", error);
    return res.status(500).json({ error: "Failed to fetch current user" });
  }
};
