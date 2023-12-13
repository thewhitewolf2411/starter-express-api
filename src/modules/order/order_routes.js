class OrderRoutes {
    constructor(router, protectedRouter, adminRouter, handlers, middleware) {
        this.router = router
        this.protected = protectedRouter
        this.adminRouter = adminRouter
        this.handlers = handlers
        this.middleware = middleware

        this.protected
            .route("/rides")
            .get((req, res, next) => this.handlers.getRidesForUserHandler(req, res).catch(next))

        this.protected
            .route("/ride/info")
            .post((req, res, next) => this.handlers.getRideInfoHandler(req, res).catch(next))

        this.protected
            .route("/ride")
            .post((req, res, next) => this.handlers.createOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/:rideId/accept")
            .post((req, res, next) => this.handlers.acceptOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/:rideId/cancel")
            .post((req, res, next) => this.handlers.cancelOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/current")
            .get((req, res, next) => this.handlers.getCurrentOrderHandler(req, res).catch(next))

    }
}

module.exports = OrderRoutes
