const Joi = require("@hapi/joi")

const validation = require("../../common/validation")
const { WithLogger } = require("../../common/classes")
const JWT = require("../../common/utils/jwt")

const jwt = new JWT()

const signJWT = (signData) => jwt.signKey(signData)

const loginPayload = Joi.object().keys({
    email: Joi.string(),
    password: Joi.string(),
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

    async getUsersHandler(req, res) {
        const [err, users] = await this.repo.getUsers()

        if (err) {
            res.status(422).send({error: 'Something went wrong'})
        }

        return res.status(200).send({users})
    }

    async getDriversHandler(req, res) {
        const [err, drivers] = await this.repo.getDrivers()

        if (err) {
            res.status(422).send({ error: 'Something went wrong' })
        }

        return res.status(200).send({drivers})
    }

    async getOrdersHandler(req, res) {
        const [err, orders] = await this.repo.getOrders()

        if (err) {
            res.status(422).send({ error: 'Something went wrong' })
        }

        return res.status(200).send({orders})
    }

    async createDriverHandler(req, res) {
        
    }

    async assignDriverToOrder(req, res) {

    }
}

module.exports = DispatcherController
