const Joi = require("@hapi/joi")
const fs = require("fs")

const validation = require("../../common/validation")

const { WithLogger, classRegistry } = require("../../common/classes")
const { ForbiddenError, NotFoundError } = require("../../common/error/errorClasses")
const { ErrorMessages } = require("../../common/error/ErrorMessages")

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
        const { startingCoordinates, endingCoordinates, estimatedPrice, isPetFriendly, isCardPayment, reminder } = req.body
        const startLongitude = startingCoordinates.lng
        const startLatitude = startingCoordinates.lat
        const endLongitude = endingCoordinates.lng
        const endLatitude = endingCoordinates.lat

        const [curError, curRide] = await this.repo.getCurrentOrder({ customerId })
        if(curError) throw curError

        const forbiddenStatuses = [1, 2, 3]

        if (curRide && forbiddenStatuses.includes(curRide.statusId)) {
            res.status(421).send({message: "You already created order"})
            return
        }

        const [err, ride] = await this.repo.createOrder({ customerId, estimatedPrice, startLongitude, startLatitude, endLongitude, endLatitude, isPetFriendly, isCardPayment, reminder})

        if (ride) process.emit(`order: created`, { ride })

        if (err) throw err

        res.status(200).send({ ride })
    }

    async getCurrentOrderHandler(req, res){

        const { id: userId } = req.user

        let [err, ride] = [null, null];

        const isDriver = await this.isUserDriver(userId)

        if (isDriver) [err, ride] = await this.repo.getCurrentDriverOrder({ driverId: userId })
        else [err, ride] = await this.repo.getCurrentOrder({ customerId: userId })

        if (err) throw err

        res.status(200).send({ ride })
    }

    async isUserDriver(userId){

        const [, driver] = await classRegistry.get("User").getDriverById({ userId })

        if (driver) return true

        return false
    }

    async cancelOrderHandler(req, res){
        const { orderId } = req.body

        const [err, ride] = await this.repo.cancelCurrentOrder({ orderId })

        if (err) throw err

        if (!ride) res.status(404)

        res.status(200).send({success: true})
    }

    async getActiveOrdersHandler(req, res){
        const [err, orders] = await this.repo.getActiveOrders()

        if (err) throw err

        res.status(200).send({ orders })
    }

    async acceptActiveOrderHandler(req, res){

        const { rideId: orderId } = req.params
        const { id: driverId } = req.user

        const [err, order] = await this.repo.getOrderById({ orderId })
        if (err) throw err
        const { statusId } = order

        if (statusId === 1) {
            const [acceptedOrderError, acceptedOrder] = await this.repo.acceptActiveOrder({ orderId, driverId })
            if (acceptedOrder) process.emit(`${acceptedOrder.customerId}.order: accepted`, { acceptedOrder })
            res.status(201).send({ acceptedOrder })
            return
        }

        res.status(401).send({message: "Order already accepted"})
    }

    async startActiveOrderHandler(req, res){
        const { rideId: orderId } = req.params
        const { id: driverId } = req.user

        const [err, order] = await this.repo.getOrderById({ orderId })
        if (err) throw err
        const { statusId, driverId: orderDriverId } = order

        if(statusId === 2 && orderDriverId === driverId) {
            const [startedOrderError, startedOrder] = await this.repo.startActiveOrder({ orderId })
            if (startedOrder) process.emit(`${startedOrder.customerId}.order: started`, { startedOrder })
            res.status(201).send({ startedOrder })
            return
        }

        res.status(400).send({message: "Something went wrong"})
    }

    async finishActiveOrderHandler(req, res){
        const { rideId: orderId } = req.params
        const { id: driverId } = req.user

        const [err, order] = await this.repo.getOrderById({ orderId })
        if (err) throw err
        const { statusId, driverId: orderDriverId } = order

        if (statusId === 3 && orderDriverId === driverId) {
            const [finishedOrderError, finishedOrder] = await this.repo.endActiveOrder({ orderId })
            if (finishedOrder) process.emit(`${finishedOrder.customerId}.order: finished`, { finishedOrder })
            res.status(201).send({ finishedOrder })
            return
        }

        res.status(400).send({ message: "Something went wrong" })
    }

    async endActiveOrderHandler(req, res){
        const { rideId: orderId } = req.params
        const { id: driverId } = req.user
        const { exactPrice } = req.body

        const [err, order] = await this.repo.getOrderById({ orderId })
        if (err) throw err
        const { statusId, driverId: orderDriverId } = order

        const isPaid = !order.cardPayment

        if (statusId === 4 && orderDriverId === driverId) {
            const [finishedOrderError, finishedOrder] = await this.repo.setOrderAsFinished({ orderId, isPaid, exactPrice })
            if (finishedOrder) process.emit(`${finishedOrder.customerId}.order: ended`, { finishedOrder })
            res.status(201).send({ finishedOrder })
            return
        }

        res.status(200)
        return
    }
}

module.exports = OrderController