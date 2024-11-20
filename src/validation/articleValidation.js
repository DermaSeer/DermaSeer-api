import Joi from "joi";

const inputArticleValidation = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().optional(),
    image_url: Joi.string().required(),
    url: Joi.string().required(),
    publish_date: Joi.date().required(),
})

const getArticleValidation = Joi.string().required();

const updateArticleValidation = Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
    image_url: Joi.string().optional(),
    url: Joi.string().optional(),
    publish_date: Joi.date().optional(),
})

const removeArticleValidation = Joi.string().required();

const searchArticleValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    title: Joi.string().optional(),
    content: Joi.string().optional(),
    publish_date: Joi.date().optional(),
})

export { inputArticleValidation, getArticleValidation, updateArticleValidation, removeArticleValidation, searchArticleValidation };