import express from "express";
import userController from "../controller/userController.js";
import productController from "../controller/productController.js";
import articleController from "../controller/articleController.js";
import modelController from "../controller/modelController.js";
import { authRateLimiterMiddleware } from "../middleware/authRateLimiterMiddleware.js";
import multer from "multer";

const userRoute = new express.Router();

const storageEngine = multer.memoryStorage();
const upload = multer({ storage: storageEngine });

userRoute.use(authRateLimiterMiddleware);
const uploadImage = upload.single("profile_picture");
const uploadImagePredict = upload.single("image");

userRoute.get("/api/users/current", userController.get);
userRoute.patch("/api/users/current", userController.updateUser);
userRoute.post("/api/users/current/data", uploadImage, userController.updateUserData);
userRoute.post("/api/users/logout", userController.logout);
userRoute.delete("/api/users/current", userController.deleteUser);

userRoute.post("/api/product", productController.input);
userRoute.get("/api/product/:id", productController.get);
userRoute.patch("/api/product/:id", productController.update);
userRoute.delete("/api/product/:id", productController.remove);
userRoute.get("/api/product", productController.search);

userRoute.post("/api/article", articleController.input);
userRoute.get("/api/article/:id", articleController.get);
userRoute.get("/api/article", articleController.search);
userRoute.patch("/api/article/:id", articleController.update);
userRoute.delete("/api/article/:id", articleController.remove);

userRoute.post("/api/model/predict", uploadImagePredict, modelController.predictModel);
userRoute.post("/api/model/recomendation", modelController.vertexAIRecommendation);
userRoute.get("/api/model/product", modelController.getProductRecommendation);
userRoute.get("/api/model/predictions", modelController.getPredictions);
userRoute.get("/api/model/predict/:id", modelController.getPredictionById);
userRoute.delete("/api/model/predict/:id", modelController.deletePrediction);

export { userRoute };
