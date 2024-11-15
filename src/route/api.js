import express from "express";
import userController from "../controller/userController.js";
import productController from "../controller/productController.js";
import { authRateLimiterMiddleware } from "../middleware/authRateLimiterMiddleware.js";
import multer from "multer";

const userRoute = new express.Router();

const storageEngine = multer.memoryStorage();
const upload = multer({ storage: storageEngine });

userRoute.use(authRateLimiterMiddleware);
const uploadImage = upload.single("profile_picture");

userRoute.get("/api/users/current", userController.get);
userRoute.patch("/api/users/current", userController.updateUser);
userRoute.post("/api/users/current/data", uploadImage, userController.updateUserData);
userRoute.post("/api/users/logout", userController.logout);

userRoute.post("/api/product", productController.input);
userRoute.get("/api/product/:id", productController.get);
userRoute.patch("/api/product/:id", productController.update);
userRoute.delete("/api/product/:id", productController.remove);
userRoute.get("/api/product", productController.search);

export { userRoute };
