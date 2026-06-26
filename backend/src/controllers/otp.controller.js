import bcrypt from "bcrypt";

export const verifyOTP = async (req, res) => {
  try {
    const { OTP } = req.body;

    if (!OTP) {
      return res.status(400).json({ error: "OTP is required" });
    }

    const pendingLogin = req.session.pendingLogin;

    if (!pendingLogin) {
      return res.status(401).json({ error: "No OTP session found" });
    }

    if (Date.now() > pendingLogin.otpExpiresAt) {
      delete req.session.pendingLogin;
      return res.status(401).json({ error: "OTP expired" });
    }

    if (pendingLogin.otpAttempts >= 5) {
      delete req.session.pendingLogin;
      return res.status(429).json({ error: "Too many OTP attempts" });
    }

    const otpIsValid = await bcrypt.compare(OTP, pendingLogin.otpHash);

    if (!otpIsValid) {
      req.session.pendingLogin.otpAttempts += 1;
      return res.status(401).json({ error: "Invalid OTP" });
    }

    req.session.UserID = pendingLogin.UserID;
    req.session.UserName = pendingLogin.UserName;

    delete req.session.pendingLogin;

    req.session.save((e) => {
      if (e) {
        console.error("Session save error:", e);
        return res.status(500).json({ error: "Session save failed" });
      }

      return res.status(200).json({
        message: req.session.UserName,
        success: true,
        redirectTo: "http://localhost:5500/frontend/homepage.html",
      });
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};
