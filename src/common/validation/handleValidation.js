const Joi = require("@hapi/joi")

const validate = (schema, data) => {
  try {
    return Joi.attempt(data, schema.options({ stripUnknown: true }))
  } catch (e) {
    const errors = []
    e.details.map((error) => errors.push(error.message))
    throw errors
  }
}

module.exports = validate
