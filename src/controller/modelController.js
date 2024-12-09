import modelService from "../service/modelService.js";

const predictModel = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  const userData = req.user;
  const request = req.body;
  const file = req.file;

  try {
    const prediction = await modelService.predictModel(authHeader, userData, request, file);
    res.status(200).json(prediction);
  } catch (e) {
    next(e);
  }
};

const vertexAIRecommendation = async (req, res, next) => {
  try {
    const product = await modelService.vertexAIRecommendation(req.body);
    res.status(200).json(product);
  } catch (e) {
    next(e);
  }
};

const getProductRecommendation = async (req, res, next) => {
  try {
    const product = await modelService.getProductRecommendation(req.query);
    res.status(200).json(product);
  } catch (e) {
    next(e);
  }
};

const getPredictions = async (req, res, next) => {
  const userData = req.user;
  try {
    const predictions = await modelService.getPredictions(userData);
    res.status(200).json(predictions);
  } catch (e) {
    next(e);
  }
};

const getPredictionById = async (req, res, next) => {
  try {
    const predict = await modelService.getPredictionById(req.params.id);
    res.status(200).json({
      status: true,
      message: "Prediction successfully retrieved",
      data: predict,
    });
  } catch (e) {
    next(e);
  }
};

const deletePrediction = async (req, res, next) => {
  try {
    const predict = await modelService.deletePrediction(req.params.id);
    res.status(200).json({
      status: true,
      message: "Prediction successfully deleted",
      data: predict,
    });
  } catch (e) {
    next(e);
  }
};
export default { predictModel, vertexAIRecommendation, getProductRecommendation, getPredictions, getPredictionById, deletePrediction };
