class UserRoutes {
  constructor(router, protectedRouter, adminRouter, handlers, middleware) {
    this.router = router
    this.protected = protectedRouter
    this.adminRouter = adminRouter
    this.handlers = handlers
    this.middleware = middleware

    this.protected
      .route("/users/:userId")
      .get((req, res, next) => this.handlers.getUserByIdHandler(req, res).catch(next))


    this.protected
      .route("/user")
      .get((req, res, next) => this.handlers.getUserByIdHandler(req, res).catch(next))
      .put((req, res, next) => this.handlers.updateUserHandler(req, res).catch(next))
  }
}

module.exports = UserRoutes
