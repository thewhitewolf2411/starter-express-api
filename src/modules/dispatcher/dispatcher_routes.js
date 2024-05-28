class DispatcherRoutes {
    constructor(router, protectedRouter, handlers) {
        this.router = router
        this.protected = protectedRouter
        this.handlers = handlers

        this.router.route("/api/admin/login")
            .post((req, res, next) => this.handlers.adminLoginHandler(req, res).catch(next))

        this.protected.route("/api/admin/users")
        
        this.protected.route("/api/admin/drivers")

        this.protected.route("/api/admin/orders")
    }
}

module.exports = DispatcherRoutes
