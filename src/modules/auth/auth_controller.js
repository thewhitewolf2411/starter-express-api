const Joi = require("@hapi/joi")

const validation = require("@common/validation")
const { WithLogger, classRegistry } = require("@common/classes")
const JWT = require("@common/utils/jwt")
const { UnprocessableContentError } = require("@common/error/errorClasses")
const { ErrorMessages } = require("@common/error/ErrorMessages")

const jwt = new JWT()

const loginPayload = Joi.object().keys({
  email: Joi.string(),
  password: Joi.string(),
})

const registerPayload = Joi.object().keys({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  phoneNumber: Joi.string().required(),
})

const signJWT = (signData) => jwt.signKey(signData)

class AuthController extends WithLogger {
  constructor(repo) {
    super()
    this.repo = repo
  }

  async healthCheckHandler(req, res) {
    res.status(200).send("Backend service is healthy")
  }

  async loginHandler(req, res) {
    const { body } = req

    const payload = validation.validate(loginPayload, body)

    const user = await classRegistry.get("User").userByEmailAndPassword(payload)
    if (user?.blocked) throw new ForbiddenError()

    if (!user) {
      return res.status(404).send({ message: "No user" })
    }

    const { id, blocked } = user

    if (blocked) throw new ForbiddenError()

    const token = signJWT({ id })

    return res.status(200).send({ token })
  }

  async registerHandler(req, res) {
    const { body } = req

    const payload = validation.validate(registerPayload, body)

    try{
      const { id: userId } = await classRegistry.get("User").addTaxiUser(payload)

      const jwtToken = await signJWT({ id: userId })
      return res.status(200).send({ token: jwtToken })
    } catch (err) {
      console.log(err)
    }

    return res.status(500)
  }

  async logoutHandler(req, res) {
    const {
      headers: { authorization },
    } = req
    const { decoded, token } = jwt.verifyTokenFromRequest(authorization)
    await this.repo.logoutUser(token, decoded)

    res.status(200).send("ok")
  }

  async verifyHandler(req, res) {
    const {
      headers: { authorization },
    } = req
    const { isValid, token } = jwt.verifyTokenFromRequest(authorization)

    if (!isValid) throw new UnprocessableContentError(ErrorMessages.INVALID_TOKEN)

    const tokenBlacklisted = await this.repo.verifyBlacklistToken(token)
    if (tokenBlacklisted) throw new UnprocessableContentError(ErrorMessages.INVALID_TOKEN)

    res.status(200).send("ok")
  }
}

module.exports = AuthController
