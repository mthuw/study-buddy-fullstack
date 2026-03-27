import { dbMySQL } from '../config/mysql.js';
import bcrypt from 'bcrypt';


export const registerUser = async (req, res) => {
    try {
        const { Email, UserName, Password, Avatar } = req.body;
        if (!Email || !UserName || !Password){
            return res.status(400).json({error: "Email, UserName, and Password are required"});
        }
        if (Password.length < 6){
            return res.status(400).json({ error: "Password must be at least 6 characters long"})
        }
        if (!Email.includes("@")){
            return res.status(400).json({ error: "Please provide a valid email address"});
        }

        const [existedUser] = await dbMySQL.query('SELECT * FROM users WHERE Email=  ?', [Email]);
        if (existedUser.length > 0) {
            return res.status(409).json({ error: "This email is already registered"});
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const insertUserQuery = 'INSERT INTO users (Email, UserName, Password, Avatar) VALUES (?,?,?,?)';
        await dbMySQL.query(insertUserQuery, [Email, UserName, hashedPassword, Avatar ?? null]);

        const insertLoginQuery = 'INSERT INTO Login (Email, Password) VALUES (?,?)';
        await dbMySQL.query(insertLoginQuery, [Email, hashedPassword]);

        return res.status(201).json({ 
            message: "User created successfully!", 
            success: true,
            redirectTo:"http://localhost:5500/frontend/login.html" });
    } catch (error) {
        return res.status(500).json({ error: "Registration failed"});
    }
};
export const loginUser = async (req,res) => {
    try {
        const {Email, Password} = req.body;
        if (!Email || !Password){
            return res.status(400).json({error:"Email and password required"});
        }
        const [rows] = await dbMySQL.query("SELECT * FROM Login WHERE Email = ? LIMIT 1", [Email]);
        if (rows.length === 0) {
            return res.status(401).json({error: "User not found"});
        }
    
        const hashedPassword = rows[0].Password;
        const success = await bcrypt.compare(Password, hashedPassword);
        if (!success) {
            return res.status(401).json({error: "Password or Email not correct"});
        }
        const [users] = await dbMySQL.query('SELECT UserID, UserName FROM users WHERE Email=  ? LIMIT 1', [Email]);
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found in users table" });
        }
        req.session.UserID =  users[0].UserID
        req.session.UserName = users[0].UserName;

        req.session.save((e)=>{
            if (e) console.error("Session save error:", e);
            console.log("Session after login:", req.session); 
            return res.status(200).json({
            message: users[0].UserName,
            success: true,
            redirectTo: "http://localhost:5500/frontend/homepage.html"
        })
    })
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({error: "Error login"});
    }  
};
export const logoutUser = async (req, res) => {
    try {
        req.session.destroy((e)=>{
            if (e) {
                return res.status(500).json({error: "User logout failed"});
            } 
        })
        res.clearCookie("connect.sid");
        return res.status(200).json({message: "Logout successful"});
    } catch (error) {
        return res.status(500).json({error: "Error logout"});
    }   
}
