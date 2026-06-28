import { Router } from "express";
import {
  registerCryptoKey,
  createCryptoChallenge,
  verifyCryptoChallenge,
} from "../controllers/cryptoVerify.controller.js";

const cryptoRouter = Router();

cryptoRouter.post("/register-key", registerCryptoKey);
cryptoRouter.post("/challenge", createCryptoChallenge);
cryptoRouter.post("/verify", verifyCryptoChallenge);
export default cryptoRouter;
