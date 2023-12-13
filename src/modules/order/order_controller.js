const Joi = require("@hapi/joi")
const fs = require("fs")

const validation = require("@common/validation")

const { WithLogger } = require("@common/classes")
const { ForbiddenError } = require("../../common/error/errorClasses")

const getRidesForUserPayload = Joi.object().keys({
    userId: Joi.string().required(),
})

class OrderController extends WithLogger {
    constructor(repo) {
        super()
        this.repo = repo
    }

    async getRidesForUserHandler(req, res){
        const { id: userId } = req.user
        const payload = validation.validate(getRidesForUserPayload, { userId })

        const [err, rides] = await this.repo.getRidesForUser(payload)

        if(err) throw err

        res.status(200).send({ rides })
    }

    async getRideInfoHandler(req, res){
        const { gDistance } = req.body

        const estimatePrice = this.calculatePriceEstimate(parseFloat(gDistance))

        res.status(200).send({ estimatePrice })
    }

    calculatePriceEstimate(distance){
        const taxiStartPrice = 2.5
        const pricePerKilometer = distance * 1.5

        const total = taxiStartPrice + pricePerKilometer

        return Math.round(total * 100) / 100
    }

    async createOrderHandler(req, res){
        const { id: customerId } = req.user
        const { startingCoordinates, endingCoordinates, estimatedPrice } = req.body
        const startLongitude = startingCoordinates.lng
        const startLatitude = startingCoordinates.lat
        const endLongitude = endingCoordinates.lng
        const endLatitude = endingCoordinates.lat

        const [curError, curRide] = await this.repo.getCurrentOrder({ customerId })

        const forbiddenStatuses = [1, 2, 3]



        if (curRide && forbiddenStatuses.includes(curRide.statusId)) {
            res.status(421).send({message: "You already created order"})
            return
        }

        const [err, ride] = await this.repo.createOrder({ customerId, estimatedPrice, startLongitude, startLatitude, endLongitude, endLatitude})

        if (ride) process.emit(`order: created`, { ride })

        if (err) throw err

        res.status(200).send({ ride })
    }

    async getCurrentOrderHandler(req, res){

        const { id: customerId } = req.user

        const [err, ride] = await this.repo.getCurrentOrder({ customerId })

        if (err) throw err

        if (!ride) res.status(404)

        res.status(200).send({ ride })
    }
}

module.exports = OrderController