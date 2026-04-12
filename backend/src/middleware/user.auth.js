export const userAuth = async (req, res, next) =>{
    try {
        if (!req.session.UserID){
            return res.status(400).json({message: "UserID not found", success: false})
        }
        req.user = {
            UserID: req.session.UserID,
            UserName: req.session.UserName
        };
        next();
    } catch (error) {
        console.log(error)
    }
}