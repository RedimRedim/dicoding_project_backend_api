const Joi = require("joi");

const bookSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
  author: Joi.string().required(),
  summary: Joi.string().required(),
  publisher: Joi.string().required(),
  pageCount: Joi.number().required(),
  readPage: Joi.number().required(),
  finished: Joi.boolean().default(false),
  reading: Joi.boolean().default(false),
});

module.exports = bookSchema;
