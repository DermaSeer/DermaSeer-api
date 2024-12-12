import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/responseError.js";
import { validate } from "../validation/validation.js";
import { inputArticleValidation, getArticleValidation, updateArticleValidation, removeArticleValidation, searchArticleValidation } from "../validation/articleValidation.js";

const create = async (req) => {
  const article = validate(inputArticleValidation, req);

  if (!article) {
    throw new ResponseError(400, "Invalid input");
  }

  return await prismaClient.article.create({
    data: {
      title: article.title,
      content: article.content,
      image_url: article.image_url,
      url: article.url,
      publish_date: new Date(article.publish_date),
    },
  });
};

const get = async (id) => {
  const articleId = validate(getArticleValidation, id);

  if (!articleId) {
    throw new ResponseError(404, "Invalid input");
  }

  const checkArticle = await prismaClient.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!checkArticle) {
    throw new ResponseError(404, "Article not found");
  }

  return await prismaClient.article.findUnique({
    where: {
      id: articleId,
    },
  });
};

const search = async (req) => {
  const article = validate(searchArticleValidation, req);

  if (!article) {
    throw new ResponseError(400, "Invalid input");
  }

  const skip = (article.page - 1) * article.size;

  const filter = [];

  if (article.title) {
    filter.push({
      title: {
        contains: article.title,
        mode: "insensitive",
      },
    });
  }

  if (article.content) {
    filter.push({
      content: {
        contains: article.content,
        mode: "insensitive",
      },
    });
  }

  const articles = await prismaClient.article.findMany({
    where: {
      AND: filter,
    },
    skip: skip,
    take: article.size,
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalItems = await prismaClient.article.count({
    where: {
      AND: filter,
    },
  });

  return {
    success: true,
    message: "Article successfully retrieved",
    data: articles,
    meta: {
      page: article.page,
      totalItems: totalItems,
      total_page: Math.ceil(totalItems / article.size),
    },
  };
};

const update = async (id, req) => {
  const articleId = validate(getArticleValidation, id);
  const article = validate(updateArticleValidation, req);

  if (!article || !articleId) {
    throw new ResponseError(400, "Invalid input");
  }

  const checkArticle = await prismaClient.article.findUnique({
    where: {
      id: articleId,
    },
  });

  if (!checkArticle) {
    throw new ResponseError(404, "Article not found");
  }

  return await prismaClient.article.update({
    where: {
      id: articleId,
    },
    data: {
      title: article.title,
      content: article.content,
      image_url: article.image_url,
      url: article.url,
      publish_date: article.publish_date,
    },
  });
};

const remove = async (id) => {
  const articleId = validate(removeArticleValidation, id);

  if (!articleId) {
    throw new ResponseError(400, "Invalid input");
  }

  const checkArticle = await prismaClient.article.findUnique({
    where: {
      id: id,
    },
  });

  if (!checkArticle) {
    throw new ResponseError(404, "Article not found");
  }

  return await prismaClient.article.delete({
    where: {
      id: id,
    },
  });
};

export default { create, get, search, update, remove };
