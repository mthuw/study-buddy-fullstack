import { Router } from "express";
import { createMessage, getMessageByChannel } from "../controllers/message.controller";

const messageRouter = Router();
messageRouter.post('/', createMessage);
messageRouter.get('/',getMessageByChannel);

export default messageRouter;
