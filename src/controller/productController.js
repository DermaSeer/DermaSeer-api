import productService from "../service/productService.js";

const input = async (req, res, next) => {
  try {
    const product = await productService.create(req.body);
    res.status(201).json({
      data: product,
    });
  } catch (e) {
    next(e);
  }
};

const get = async (req, res, next) => {
  try {
    const product = await productService.get(req.params.id);
    res.status(200).json({
      data: product,
    });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const product = await productService.update(req.params.id, req.body);
    res.status(200).json({
      data: product,
    });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await productService.remove(req.params.id);
    res
      .status(200)
      .json({
        data: "product removed",
      })
      .end();
  } catch (e) {
    next(e);
  }
};

const search = async (req, res, next) => {
  try {
    const product = await productService.search(req.query, req.body);
    res.status(200).json(product);
  } catch (e) {
    next(e);
  }
};

export default { input, get, update, remove, search };
