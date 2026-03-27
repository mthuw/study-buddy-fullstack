export const adminLogin = async (req,res)=>{
    try {
        const {email, password} = req.body;
        if (!email || !password){
            return res.status(400).json({message:"Email and Password required"});
        }
        if (email !== process.env.ADMIN_EMAIL && password !== process.env.ADMIN_PASSWORD){
            return res.status(401).json({message:"Incorrect Email or Password"});
        }
        req.session.UserID = "admin";
        req.session.UserName = "Admin";
        req.session.role = "admin";
        req.session.save((e)=>{
            if (e) return res.status(500).json({error:"Session error"});
            return res.status(200).json({success: true, message:req.session.UserID+", "+req.session.UserName});
        })

    } catch (error) {
        console.error("Admin login error", error);
        return res.status(400).json({error: "Login error"});
    }
}
export const adminLogout = async (req,res)=>{
    req.session.destroy((e)=>{
        if (e){
            return res.status(500).json({error: "Admin logout failed"});
        }
        es.clearCookie("connect.sid");
        return res.status(200).json({message: "Logout successful"});
    })
}