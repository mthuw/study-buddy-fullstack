import { dbMySQL } from "../config/mysql.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password required" });
    }
    if (
      email !== process.env.ADMIN_EMAIL &&
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Incorrect Email or Password" });
    }
    req.session.UserID = "admin";
    req.session.UserName = "Admin";
    req.session.role = "admin";
    req.session.save((e) => {
      if (e) return res.status(500).json({ error: "Session error" });
      console.log("Session after login:", req.session);
      return res.status(200).json({
        success: true,
        message: req.session.UserID + ", " + req.session.UserName,
        redirectTo: "http://localhost:5500/admin/admin.html",
      });
    });
  } catch (error) {
    console.error("Admin login error", error);
    return res.status(400).json({ error: "Login error" });
  }
};
export const adminLogout = async (req, res) => {
  try {
    req.session.destroy((e) => {
      if (e) {
        return res.status(500).json({ error: "Admin logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logout successful" });
    });
  } catch (error) {
    return res.status(500).json({ error: "Error logout" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const [users] = await dbMySQL.query(
      "SELECT UserID, Email, Password, UserName, Avatar FROM users",
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users for admin:", error);
    res.status(500).json({ error: "Failed to fetch user data from database." });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!email.includes("@")) {
      return res
        .status(400)
        .json({ error: "Please provide a valid email address" });
    }
    const [userExist] = await dbMySQL.query(
      "SELECT * FROM users WHERE UserID = ?",
      [id],
    );
    if (userExist.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const [updatedEmail] = await dbMySQL.query(
      "SELECT * FROM users WHERE Email = ? AND UserID != ?",
      [email, id],
    );
    if (updatedEmail.length > 0) {
      return res.status(409).json({ error: "Email is already in use" });
    }
    const oldEmail = userExist[0].Email;
    await dbMySQL.query("UPDATE users SET Email = ? WHERE UserID = ?", [
      email,
      id,
    ]);
    await dbMySQL.query("UPDATE Login SET Email = ? WHERE Email = ?", [
      email,
      oldEmail,
    ]);
    return res
      .status(200)
      .json({ message: "User updated successfully", success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [deleteUser] = await dbMySQL.query(
      "SELECT * FROM users WHERE UserID = ?",
      [id],
    );
    if (deleteUser.length === 0) {
      return res.status(400).json({ error: "No user found to delete" });
    }
    const email = deleteUser[0].Email;
    await dbMySQL.query("DELETE FROM users WHERE UserID = ?", [id]);
    await dbMySQL.query("DELETE FROM Login WHERE Email = ?", [email]);
    return res
      .status(200)
      .json({ message: "User deleted successfully", success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};
