/* eslint-disable no-unreachable */
const Joi = require("@hapi/joi")

const validation = require("@common/validation")
const { WithLogger } = require("@common/classes")
const { wsPort } = require("../../../config")

const createUserPayload = Joi.object().keys({
  email: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  password: Joi.string().required(),
})

const getUserByIdPayload = Joi.object().keys({
  userId: Joi.string().required(),
})

const updateUserPayload = Joi.object().keys({
  userId: Joi.string().required(),
  email: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
})

const updateCaregiverPayload = Joi.object().keys({
  userId: Joi.string().required(),
  shortDesc: Joi.string().required(),
  longDesc: Joi.string().required(),
  expertise: Joi.array().items(Joi.string().required()),
})

class UserController extends WithLogger {
  constructor(repo, server) {
    super()
    this.repo = repo
    this.server = server
  }

  async getUserByIdHandler(req, res) {
    const { id: userId } = req.user
    const payload = validation.validate(getUserByIdPayload, { userId })

    let err
    let user
    ;[err, user] = await this.repo.getUserById(payload)

    if (err) throw err

    res.status(200).send({user})
  }

  async createUserHandler(req, res) {
    const { body } = req
    const payload = validation.validate(createUserPayload, body)

    const [err, user] = await this.repo.createUser({ ...payload, gender })

    if (err) throw err

    res.status(200).send(user)
  }
  
  async updateUserHandler(req, res) {
    const { user, body } = req
    const { id: userId } = user
    const toValidate = {
      userId,
      ...body,
    }

    const payload = validation.validate(updateUserPayload, toValidate)

    try {
      const [updatedUserError, updatedUser] = await this.repo.updateUser(payload)
      if (updatedUserError) throw updatedUserError

      res.status(200).send({updatedUser})
    } catch (error) {
      this.logger.error(error)
      res.status(500).send(error)
    }
  }

  async updateDriverHandler(req, res) {
    const { user, body } = req
    const toValidate = {
      userId: user.id,
      ...body,
    }

    const payload = validation.validate(updateCaregiverPayload, toValidate)

    const { expertise } = body

    const [error, existsingExpertise] = await this.repo.getExpertise()

    const notValidExp = checkExpertiseExists(existsingExpertise, expertise)

    if (notValidExp.length > 0) throw new BadRequestError(`Expertise "${notValidExp}" is not valid`)

    const [err, updatedCaregiver] = await this.repo.updateCaregiver(payload)

    if (err || error) throw err || error

    res.status(200).send(updatedCaregiver)
  }
}

module.exports = UserController
