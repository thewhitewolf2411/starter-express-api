const Joi = require("@hapi/joi")
const fs = require("fs")

const validation = require("../../common/validation")

const { WithLogger, classRegistry } = require("../../common/classes")
const { ForbiddenError, NotFoundError } = require("../../common/error/errorClasses")
const { ErrorMessages } = require("../../common/error/ErrorMessages")

const getRidesForUserPayload = Joi.object().keys({
    userId: Joi.string().required(),
})

class PaymentController extends WithLogger {
    constructor(repo) {
        super()
        this.repo = repo
    }

    async payOrderHandler(req, res){
        const { rideId: orderId } = req.params

        const [, orderPaid] = await this.repo.orderPaid({ orderId })

        res.status(200).send({ orderPaid })
    }

}

module.exports = PaymentController