const { WithLogger } = require("@common/classes")
const AuthRoutes = require("./auth_routes")
const AuthController = require("./auth_controller")
const AuthRepo = require("./auth_repository")

// AuthInterface is used to instanciate the Auth module and put the routes on the injected router.
// and use the provided DB access

class AuthInterface extends WithLogger {
  constructor(router, protectedRouter, db, bcrypt) {
    super()
    this.router = router
    this.protectedRouter = protectedRouter
    this.db = db

    this.repo = new AuthRepo(this.db)
    this.handlers = new AuthController(this.repo, bcrypt)
    this.routes = new AuthRoutes(this.router, this.protectedRouter, this.handlers)
  }
}

module.exports = AuthInterface
