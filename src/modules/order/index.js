const { WithLogger } = require("@common/classes")
const OrderRoutes = require("./order_routes")
const OrderController = require("./order_controller")
const OrderRepo = require("./order_repository")
const OrderMiddleware = require("./order_middleware")

class OrderInterface extends WithLogger {
    constructor(router, protectedRouter, adminRouter, db) {
        super()
        this.router = router
        this.protectedRouter = protectedRouter
        this.adminRouter = adminRouter
        this.db = db

        this.repo = new OrderRepo(this.db)
        this.middleware = new OrderMiddleware(this.repo)
        this.handlers = new OrderController(this.repo)
        this.routes = new OrderRoutes(this.router, this.protectedRouter, this.adminRouter, this.handlers, this.middleware)
    }
}

module.exports = OrderInterface