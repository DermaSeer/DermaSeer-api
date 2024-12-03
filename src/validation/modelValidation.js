import Joi from "joi";

const predictionValidation = Joi.object({
  image: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid("image/jpeg", "image/png", "image/gif", "image/webp").required(),
    buffer: Joi.binary().required(),
    size: Joi.number()
      .max(10 * 1024 * 1024)
      .required(),
  }).required(),
});

const recommendedValidation = Joi.object({
  predict_id: Joi.string().required(),
  skin_type: Joi.string().required(),
  product_category: Joi.string().required(),
});

const getProductRecommendationValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  product_id: Joi.string().optional(),
  result_id: Joi.string().required(),
});

const vertexAIValidation = Joi.object().required();

const getPredictionByIdValidation = Joi.string().required();

export { recommendedValidation, getProductRecommendationValidation, vertexAIValidation, predictionValidation, getPredictionByIdValidation };
