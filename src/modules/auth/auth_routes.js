class AuthRoutes {
  constructor(router, protectedRouter, handlers) {
    this.router = router
    this.protected = protectedRouter
    this.handlers = handlers

    this.router.route("/healthy").get((req, res, next) => this.handlers.healthCheckHandler(req, res).catch(next))

    this.router.route("/auth/login").post((req, res, next) => this.handlers.loginHandler(req, res).catch(next))
    this.router.route("/auth/register").post((req, res, next) => this.handlers.registerHandler(req, res).catch(next))

    this.router.route("/auth/verify").get((req, res, next) => this.handlers.verifyHandler(req, res).catch(next))
    this.protected.route("/auth/logout").get((req, res, next) => this.handlers.logoutHandler(req, res).catch(next))
  }
}

module.exports = AuthRoutes
