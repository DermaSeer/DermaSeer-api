import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/responseError.js";
import { validate } from "../validation/validation.js";
import { inputArticleValidation, getArticleValidation, updateArticleValidation, removeArticleValidation, searchArticleValidation } from "../validation/articleValidation.js";


const create = async (req) => {
    const article = validate(inputArticleValidation, req);
    
    if (!article) {
        throw new ResponseError(400, "invalid input");
    }
    
    return await prismaClient.article.create({
        data: {
        title: article.title,
        content: article.content,
        image_url: article.image_url,
        url: article.url,
        },
    });
}

const get = async (id) => {
    const articleId = validate(getArticleValidation, id);

    if (!articleId) {
        throw new ResponseError(400, "invalid input");
    }

    return await prismaClient.article.findUnique({
        where: {
        id: id,
        },
    });
}

const search = async (req) => {
    const article = validate(searchArticleValidation, req);

    if (!article) {
        throw new ResponseError(400, "invalid input");
    }

    const skip = (article.page - 1) * article.size;

    const filter = [];

    if (article.title) {
        filter.push({
        title: {
            contains: article.title,
        },
        });
    }
    if (article.content) {
        filter.push({
        content: {
            contains: article.content,
        },
        });
    }

    const articles = await prismaClient.article.findMany({
        where: {
        AND: filter,
        },
        skip: skip,
        take: article.size,
    });

    const totalItems = await prismaClient.article.count({
        where: {
        AND: filter,
        },
    });

    return {
        data: articles,
        meta: {
        totalItems: totalItems,
        page: article.page,
        size: article.size,
        },
    };
}

const update = async (id, req) => {
    const articleId = validate(getArticleValidation, id);
    const article = validate(updateArticleValidation, req);

    if (!articleId || !article) {
        throw new ResponseError(400, "invalid input");
    }

    return await prismaClient.article.update({
        where: {
        id: id,
        },
        data: {
        title: article.title,
        content: article.content,
        image_url: article.image_url,
        url: article.url,
        },
    });
}

const remove = async (id) => {
    const articleId = validate(removeArticleValidation, id);

    if (!articleId) {
        throw new ResponseError(400, "invalid input");
    }

    return await prismaClient.article.delete({
        where: {
        id: id,
        },
    });
}

export default { create, get, search, update, remove };