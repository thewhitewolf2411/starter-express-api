class PaymentRoutes {
    constructor(router, protectedRouter, adminRouter, handlers, middleware) {
        this.router = router
        this.protected = protectedRouter
        this.adminRouter = adminRouter
        this.handlers = handlers
        this.middleware = middleware

        this.protected
            .route("/order/pay/:rideId")
            .post((req, res, next) => this.handlers.payOrderHandler(req, res).catch(next))

    }
}

module.exports = PaymentRoutes