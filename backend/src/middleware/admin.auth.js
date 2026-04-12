export const adminAuth = async (req, res, next) =>{
    try {
        if (!req.session.UserID){
            return res.status(400).json({message: "Admin not found", success: false})
        }
        req.user = {
            UserID: req.session.UserID,
            UserName: req.session.UserName,
            role: req.session.role
        };
        next();
    } catch (error) {
        console.log(error)
    }
}