import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/responseError.js";
import { validate } from "../validation/validation.js";
import { inputProductValidation, getProductValidation, searchProductValidation, searchDescriptionValidation } from "../validation/productValidation.js";

const create = async (req) => {
  const product = validate(inputProductValidation, req);

  if (!product) {
    throw new ResponseError(400, "invalid input");
  }

  return await prismaClient.product.create({
    data: {
      name: product.name,
      price: product.price,
      category: product.category,
      shop_name: product.shop_name,
      url: product.url,
      image_url: product.image_url,
      product_rating: product.product_rating,
      description: product.description,
    },
  });
};

const get = async (id) => {
  const productId = validate(getProductValidation, id);

  if (!productId) {
    throw new ResponseError(400, "invalid input");
  }

  const product = await prismaClient.product.findUnique({
    where: {
      id: id,
    },
  });

  if (!product) {
    throw new ResponseError(404, "product not found");
  }

  return product;
};

const update = async (id, req) => {
  const product = validate(inputProductValidation, req);

  if (!product) {
    throw new ResponseError(400, "invalid input");
  }

  const checkProduct = await prismaClient.product.findUnique({
    where: {
      id: id,
    },
  });

  if (!checkProduct) {
    throw new ResponseError(404, "product not found");
  }

  return await prismaClient.product.update({
    where: {
      id: id,
    },
    data: {
      name: product.name,
      price: product.price,
      category: product.category,
      shop_name: product.shop_name,
      url: product.url,
      image_url: product.image_url,
      product_rating: product.product_rating,
      description: product.description,
    },
  });
};

const remove = async (id) => {
  const productId = validate(getProductValidation, id);

  if (!productId) {
    throw new ResponseError(400, "invalid input");
  }

  const product = await prismaClient.product.findUnique({
    where: {
      id: id,
    },
  });

  if (!product) {
    throw new ResponseError(404, "product not found");
  }

  return await prismaClient.product.delete({
    where: {
      id: id,
    },
  });
};

const search = async (req, body) => {
  req = validate(searchProductValidation, req);
  body = validate(searchDescriptionValidation, body);

  if (!req) {
    throw new ResponseError(400, "invalid input");
  }

  const skip = (req.page - 1) * req.size;

  const filter = [];

  if (body.description) {
    const descriptions = Array.isArray(body.description) ? body.description : [body.description];
    const descriptionFilters = descriptions.map((description) => ({
      description: {
        contains: description,
      },
    }));
    filter.push({
      OR: descriptionFilters,
    });
  }

  if (req.name) {
    filter.push({
      name: {
        contains: req.name,
      },
    });
  }

  if (req.category) {
    filter.push({
      category: {
        contains: req.category,
      },
    });
  }

  if (req.shop_name) {
    filter.push({
      shop_name: {
        contains: req.shop_name,
      },
    });
  }

  if (req.product_rating) {
    filter.push({
      product_rating: {
        equals: req.product_rating,
      },
    });
  }

  if (req.description) {
    filter.push({
      description: {
        contains: req.description,
      },
    });
  }

  if (req.price) {
    filter.push({
      price: {
        equals: req.price,
      },
    });
  }

  const product = await prismaClient.product.findMany({
    where: {
      AND: filter,
    },
    skip: skip,
    take: req.size,
  });

  const totalItems = await prismaClient.product.count({
    where: {
      AND: filter,
    },
  });

  return {
    data: product,
    meta: {
      totalItems: totalItems,
      page: req.page,
      size: req.size,
    },
  };
};

export default { create, get, update, remove, search };
