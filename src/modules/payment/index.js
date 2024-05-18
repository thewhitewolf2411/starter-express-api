const { WithLogger } = require("../../common/classes")
const PaymentRoutes = require("./payment_routes")
const PaymentController = require("./payment_controller")
const PaymentRepo = require("./payment_repository")
const PaymentMiddleware = require("./payment_middleware")

class PaymentInterface extends WithLogger {
    constructor(router, protectedRouter, adminRouter, db) {
        super()
        this.router = router
        this.protectedRouter = protectedRouter
        this.adminRouter = adminRouter
        this.db = db

        this.repo = new PaymentRepo(this.db)
        this.middleware = new PaymentMiddleware(this.repo)
        this.handlers = new PaymentController(this.repo)
        this.routes = new PaymentRoutes(this.router, this.protectedRouter, this.adminRouter, this.handlers, this.middleware)
    }
}

module.exports = PaymentInterface