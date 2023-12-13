const Joi = require("@hapi/joi")

const validation = require("@common/validation")
const { WithLogger } = require("@common/classes")
const { BadRequestError, ForbiddenError } = require("@common/error/errorClasses")
const { ErrorMessages } = require("@common/error/ErrorMessages")

const updateSessionPayload = Joi.object().keys({
  sessionId: Joi.number().required(),
  journalized: Joi.boolean().required(),
})

const updateAvailabilityPayload = Joi.object().keys({
  userId: Joi.string().required(),
  available: Joi.boolean().required(),
})

const updateMaxPatientsPayload = Joi.object().keys({
  userId: Joi.string().required(),
  maxPatients: Joi.number().required(),
})

const getSessionsPayload = Joi.object().keys({
  userId: Joi.string().required(),
  active: Joi.boolean(),
  limit: Joi.number(),
})

class UserMiddleware extends WithLogger {
  constructor(repo) {
    super()
    this.repo = repo
  }

  parseKaddioWebhookBody = async (req, res, next) => {
    try {
      if (!req.body._id && typeof req.body !== "string") {
        const body = []
        req.body = await new Promise((resolve) => {
          req.on("data", (chunk) => body.push(chunk)).on("end", () => resolve(Buffer.concat(body).toString()))
        })
      }
      if (typeof req.body === "string") req.body = JSON.parse(req.body)
      next()
    } catch (e) {
      next(e)
    }
  }

  adminToUser = (req, res, next) => {
    if (req.user.isAdmin) {
      req.user = { id: req.params.userId, isAdmin: true }
    }
    next()
  }


  validateUpdateSession = async (req, res, next) => {
    try {
      const { params, body } = req
      const toValidate = {
        ...params,
        ...body,
      }

      req.body = validation.validate(updateSessionPayload, toValidate)

      next()
    } catch (e) {
      next(e)
    }
  }

  validateUpdateAvailabilityPayload = async (req, res, next) => {
    try {
      const { params, body } = req
      const toValidate = {
        ...params,
        ...body,
      }

      req.body = validation.validate(updateAvailabilityPayload, toValidate)

      next()
    } catch (e) {
      next(e)
    }
  }

  validateUpdateMaxPatientsPayload = async (req, res, next) => {
    try {
      const { params, body } = req
      const toValidate = {
        ...params,
        ...body,
      }

      req.body = validation.validate(updateMaxPatientsPayload, toValidate)

      next()
    } catch (e) {
      next(e)
    }
  }

  validateGetSessionsPayload = async (req, res, next) => {
    try {
      const { params, query } = req

      req.body = validation.validate(getSessionsPayload, { ...params, ...query })

      next()
    } catch (e) {
      next(e)
    }
  }

  checkSession = async (req, res, next) => {
    try {
      const {
        user: { id: userId },
        body: { sessionId },
      } = req

      const [err, session] = await this.repo.getSession({ sessionId, caregiverId: userId })
      if (err) throw err
      if (!session) throw new ForbiddenError()

      next()
    } catch (e) {
      next(e)
    }
  }

  checkCaregiverProfileUpdate = async (req, res, next) => {
    try {
      const {
        user: { id: userId },
        body: { userId: caregiverId },
      } = req

      if (userId !== caregiverId) throw new ForbiddenError()

      next()
    } catch (e) {
      next(e)
    }
  }

  checkGetSessionsPermission = async (req, res, next) => {
    try {
      const {
        user: { id },
        body: { userId },
      } = req

      if (id !== userId) throw new ForbiddenError()

      next()
    } catch (e) {
      next(e)
    }
  }
}

module.exports = UserMiddleware
