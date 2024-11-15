import articleService from '../service/articleService.js';

const input = async (req, res, next) => {
  try {
    const article = await articleService.create(req.body);
    res.status(201).json({
      data: article,
    });
  } catch (e) {
    next(e);
  }
}

const get = async (req, res, next) => {
    try {
        const article = await articleService.getById(req.params.id);
        res.status(200).json({
        data: article,
        });
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {
        const article = await articleService.search(req.query);
        res.status(200).json(article);
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const article = await articleService.update(req.params.id, req.body);
        res.status(200).json({
        data: article,
        });
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        await articleService.remove(req.params.id);
        res.status(200).json({
            message: "Removed",
        });
    } catch (e) {
        next(e);
    }
}

export default { input, get, search, update, remove };