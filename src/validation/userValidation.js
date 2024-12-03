import Joi from "joi";

const inputUserValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const getUserValidation = Joi.object().required();

const updateUserValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().optional(),
});

const updateUserDataValidation = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().optional(),
  gender: Joi.string().optional(),
  profile_picture: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().valid("image/jpeg", "image/png", "image/gif", "image/webp").required(),
    buffer: Joi.binary().required(),
    size: Joi.number()
      .max(5 * 1024 * 1024)
      .required(),
  }).optional(),
});

export { inputUserValidation, getUserValidation, updateUserValidation, updateUserDataValidation };
