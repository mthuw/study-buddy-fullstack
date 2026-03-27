import { Router } from 'express';
import { createPost, getPosts } from '../controllers/post.controller.js';
import { userAuth } from '../middleware/user.auth.js';

const postRouter = Router();

postRouter.post('/newPost', userAuth, createPost);
postRouter.get('/getPosts', userAuth, getPosts);

export default postRouter;