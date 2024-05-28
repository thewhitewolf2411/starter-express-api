const { WithLogger } = require("../../common/classes")
const DispatcherRoutes = require("./dispatcher_routes")
const DispatcherController = require("./dispatcher_controller")
const DispatcherRepo = require("./dispatcher_repository")

// AuthInterface is used to instanciate the Auth module and put the routes on the injected router.
// and use the provided DB access

class DispatcherInterface extends WithLogger {
    constructor(router, protectedRouter, db, bcrypt) {
        super()
        this.router = router
        this.protectedRouter = protectedRouter
        this.db = db

        this.repo = new DispatcherRepo(this.db)
        this.handlers = new DispatcherController(this.repo, bcrypt)
        this.routes = new DispatcherRoutes(this.router, this.protectedRouter, this.handlers)
    }
}

module.exports = DispatcherInterface
