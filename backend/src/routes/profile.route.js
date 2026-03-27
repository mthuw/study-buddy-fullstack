import { Router } from "express";
import { createProfilePost, getProfilePosts } from "../controllers/profile.controller.js";
import { userAuth } from "../middleware/user.auth.js";


const profileRouter = Router();

profileRouter.post('/newProfilePost', userAuth, createProfilePost);
profileRouter.get('/getProfilePosts', userAuth, getProfilePosts);

export default profileRouter;

