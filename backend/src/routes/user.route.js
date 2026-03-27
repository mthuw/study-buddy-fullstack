import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller.js';
import { userAuth } from '../middleware/user.auth.js';

const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/logout',userAuth, logoutUser);

export default userRouter;