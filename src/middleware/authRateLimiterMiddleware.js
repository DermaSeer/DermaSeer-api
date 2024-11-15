import rateLimit from "express-rate-limit";
import { authMiddleware } from "./authMiddleware.js";

const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user.uid,
  message: "Terlalu banyak permintaan, coba lagi nanti.",
});

export const authRateLimiterMiddleware = [authMiddleware, userLimiter];
