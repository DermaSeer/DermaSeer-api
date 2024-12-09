import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
  message: "Too many request, please try again later.",
});

export { limiter };
