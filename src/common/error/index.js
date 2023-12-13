const logger = require("@common/logger")

exports.errorHandling = (err, req, res, next) => {
  logger.error(err, { body: req.body, user: req.user, endpoint: req.path })
  if (res.headersSent) return

  let message = err.translatedMessage || err.message
  let status = err.status || err.statusCode

  // PostgresErr
  if (typeof err.code === "string" && Number(err.code)) message = "Database Error"
  else if (Array.isArray(err)) {
    status = 400
    message = err[0]
  } // Validation error

  res.status(status || 500).send(message || "Internal Server Error")
}
