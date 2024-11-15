import express from "express";
import { publicRouter } from "../route/publicApi.js";
import { errorMiddleware } from "../middleware/errorMiddleware.js";
import { userRoute } from "../route/api.js";

export const web = express();

web.use(express.json());

web.use(publicRouter);
web.use(userRoute);
web.use(errorMiddleware);
