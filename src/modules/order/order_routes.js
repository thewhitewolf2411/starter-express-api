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
            .post((req, res, next) => this.handlers.acceptActiveOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/:rideId/start")
            .post((req, res, next) => this.handlers.startActiveOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/:rideId/finish")
            .post((req, res, next) => this.handlers.finishActiveOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/:rideId/end")
            .post((req, res, next) => this.handlers.endActiveOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/:rideId/paid")
            .post((req, res, next) => this.handlers.setPaidActiveOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/:rideId/cancel")
            .post((req, res, next) => this.handlers.cancelOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/current")
            .get((req, res, next) => this.handlers.getCurrentOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/current/cancel")
            .post((req, res, next) => this.handlers.cancelCurrentOrderHandler(req, res).catch(next))

        this.protected
            .route("/ride/driver/open")
            .get((req, res, next) => this.handlers.getActiveOrdersHandler(req, res).catch(next))

    }
}

module.exports = OrderRoutes
