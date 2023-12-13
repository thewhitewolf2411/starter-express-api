const { ErrorMessages } = require("@common/error/ErrorMessages")
const { isDev } = require("@config")

class CustomError extends Error {
  status

  errorMeta

  translatedMessage

  /**
   * @param {string|ErrorTranslation} message
   * @param {number} status
   * @param {supportedLanguages} [lang]
   * @param {any} [metadata]
   */
  constructor(message, status, lang, metadata) {
    super(typeof message === "string" ? message : message.enUS)
    this.status = status
    this.errorMeta = metadata
    this.translatedMessage = this.getTranslatedMessage(message, lang)
  }

  getTranslatedMessage(message, lang) {
    if (typeof message === "string") return message
    if (isDev) return message.enUS
    if (!isDev && !lang) return message.svSE || message.enUS
    return message[lang]
  }
}

class BadRequestError extends CustomError {
  /**
   * @param {string|ErrorTranslation} [message]
   * @param {supportedLanguages} [lang]
   * @param {any} [metadata]
   */
  constructor(message, lang, metadata) {
    super(message || ErrorMessages.BAD_REQUEST.enUS, 400, lang, metadata)
  }
}

class NotFoundError extends CustomError {
  /**
   * @param {string|ErrorTranslation} [message]
   * @param {supportedLanguages} [lang]
   * @param {any} [metadata]
   */
  constructor(message, lang, metadata) {
    super(message || ErrorMessages.NOT_FOUND.enUS, 404, lang, metadata)
  }
}

class ForbiddenError extends CustomError {
  /**
   * @param {string|ErrorTranslation} [message]
   * @param {supportedLanguages} [lang]
   * @param {any} [metadata]
   */
  constructor(message, lang, metadata) {
    super(message || ErrorMessages.FORBIDDEN.enUS, 403, lang, metadata)
  }
}

class UnprocessableContentError extends CustomError {
  /**
   * @param {string|ErrorTranslation} [message]
   * @param {supportedLanguages} [lang]
   * @param {any} [metadata]
   */
  constructor(message, lang, metadata) {
    super(message || ErrorMessages.UNPROCESSABLE_CONTENT.enUS, 422, lang, metadata)
  }
}

class ServerError extends CustomError {
  /**
   * @param {string|ErrorTranslation} [message]
   * @param {supportedLanguages} [lang]
   * @param {any} [metadata]
   */
  constructor(message, lang, metadata) {
    super(message || ErrorMessages.SERVER.enUS, 500, lang, metadata)
  }
}

class ServiceUnavailableError extends CustomError {
  /**
   * @param {string|ErrorTranslation} [message]
   * @param {supportedLanguages} [lang]
   * @param {any} [metadata]
   */
  constructor(message, lang, metadata) {
    super(message || ErrorMessages.SERVICE_UNAVAILABLE.enUS, 503, lang, metadata)
  }
}

module.exports = {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  UnprocessableContentError,
  ServerError,
  ServiceUnavailableError,
}
