class DispatcherRoutes {
    constructor(router, protectedRouter, handlers) {
        this.router = router
        this.protected = protectedRouter
        this.handlers = handlers

        this.router.route("/api/admin/login")
            .post((req, res, next) => this.handlers.adminLoginHandler(req, res).catch(next))

        this.protected.route("/api/admin/customers")
            .get((req, res, next) => this.handlers.getCustomersHandler(req, res).catch(next))

        this.protected.route("/api/admin/customer/:id")
            .get((req, res, next) => this.handlers.getCustomerHandler(req, res).catch(next))
            .delete((req, res, next) => this.handlers.deleteCustomerHandler(req, res).catch(next))
        
        this.protected.route("/api/admin/drivers")
            .get((req, res, next) => this.handlers.getDriversHandler(req, res).catch(next))
            .post((req, res, next) => this.handlers.createDriverHandler(req, res).catch(next))

        this.protected.route("/api/admin/driver/:id")
            .get((req, res, next) => this.handlers.getDriverHandler(req, res).catch(next))
            .put((req, res, next) => this.handlers.updateDriverHandler(req, res).catch(next))
            .delete((req, res, next) => this.handlers.deleteDriverHandler(req, res).catch(next))

        this.protected.route("/api/admin/orders")
            .get((req, res, next) => this.handlers.getOrdersHandler(req, res).catch(next))
            .put((req, res, next) => this.handlers.assingDriverHandler(req, res).catch(next))

        this.protected.route("/api/admin/messages")
            .get((req, res, next) => this.handlers.getMessagesHandler(req, res).catch(next))
    }
}

module.exports = DispatcherRoutes
