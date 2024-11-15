import express from "express";
import userController from "../controller/userController.js";
import { limiter } from "../middleware/rateLimitMiddleware.js";

const publicRouter = new express.Router();

publicRouter.use(limiter);

publicRouter.post("/api/register", userController.register);
publicRouter.post("/api/login", userController.login);

export { publicRouter };
