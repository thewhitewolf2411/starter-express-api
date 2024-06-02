const Joi = require("@hapi/joi")

const validation = require("../../common/validation")
const { WithLogger, classRegistry } = require("../../common/classes")
const JWT = require("../../common/utils/jwt")
const { ForbiddenError } = require("../../common/error/errorClasses")

const jwt = new JWT()

const signJWT = (signData) => jwt.signKey(signData)

const loginPayload = Joi.object().keys({
    email: Joi.string(),
    password: Joi.string(),
})

const registerDriverPayload = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    carModel: Joi.string().required(),
    carNumber: Joi.string().required(),
    shortDesc: Joi.string().required(),
    longDesc: Joi.string().required()
})

class DispatcherController extends WithLogger {
    constructor(repo) {
        super()
        this.repo = repo
    }

    async adminLoginHandler(req, res) {
        const { body } = req

        const payload = validation.validate(loginPayload, body)

        const [err, user] = await this.repo.getAdminUser(payload)

        if (!user || err || (user.password !== payload.password)) {
            res.status(401).send({ error: 'Invalid credentials' })
            return
        }

        const { id } = user

        const token = signJWT({ id, user })

        return res.status(200).send({ token, user })
    }

    async getCustomersHandler(req, res) {
        const [err, customers] = await this.repo.getUsers()

        if (err) {
            console.log(err)
            res.status(422).send({error: 'Something went wrong'})
            return
        }

        return res.status(200).send({customers})
    }

    async getDriversHandler(req, res) {
        const [err, drivers] = await this.repo.getDrivers()

        if (err) {
            console.log(err)
            res.status(422).send({ error: 'Something went wrong' })
            return
        }

        return res.status(200).send({drivers})
    }

    async getOrdersHandler(req, res) {
        const [err, orders] = await this.repo.getOrders()

        if (err) {
            console.log(err)
            res.status(422).send({ error: 'Something went wrong' })
            return
        }

        return res.status(200).send({orders})
    }

    async createDriverHandler(req, res) {
        const { body } = req

        const payload = validation.validate(registerDriverPayload, body)
        const { email } = payload

        const [, user] = await classRegistry.get("User").userByEmail({ email })
        if (user) throw new ForbiddenError()

        try {
            const [err, driver] = await this.repo.addDriverUser(payload)
            if (err) throw err
            return res.status(200).send({ driver })
        } catch (err) {
            console.log(err)
        }

        return res.status(500)
    }

    async assignDriverToOrder(req, res) {

    }
}

module.exports = DispatcherController
