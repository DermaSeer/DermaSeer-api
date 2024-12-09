import rateLimit from "express-rate-limit";
import { authMiddleware } from "./authMiddleware.js";

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  keyGenerator: (req) => req.user.uid,
  message: "Too many request, please try again later.",
});

export const authRateLimiterMiddleware = [authMiddleware, userLimiter];
