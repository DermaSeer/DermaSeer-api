import Joi from "joi";

const inputProductValidation = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  shop_name: Joi.string().required(),
  image_url: Joi.string().required(),
  url: Joi.string().required(),
  product_rating: Joi.number().required(),
  price: Joi.number().required(),
  description: Joi.string().required(),
});

const getProductValidation = Joi.string().required();

const updateProductValidation = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  shop_name: Joi.string().optional(),
  image_url: Joi.string().optional(),
  url: Joi.string().optional(),
  product_rating: Joi.number().optional(),
  price: Joi.number().optional(),
  description: Joi.string().optional(),
});

const searchProductValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).positive().max(100).default(10),
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  shop_name: Joi.string().optional(),
  product_rating: Joi.number().optional(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
});

const searchDescriptionValidation = Joi.object({
  description: Joi.array().optional(),
});

export { inputProductValidation, getProductValidation, searchProductValidation, updateProductValidation, searchDescriptionValidation };
