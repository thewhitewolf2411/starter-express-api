require("module-alias/register")

const express = require("express")

const app = express()
const bcrypt = require("bcryptjs")
const cors = require("cors")
const config = require("./config")
const { classRegistry } = require("./src/common/classes")
const { httpLogger } = require("./src/common/middlewares")
const logger = require("./src/common/logger")
const db = require("./src/common/db")
const JWT = require("./src/common/utils/jwt")
const { Server } = require("socket.io")
const { createServer } = require('node:http')

const AuthModule = require("./src/modules/auth")
const UserModule = require("./src/modules/user")
const OrderModule = require("./src/modules/order")
const PaymentModule = require("./src/modules/payment")
const DispatcherModule = require("./src/modules/dispatcher")

const protectedRouter = express.Router()
const adminRouter = express.Router()
const router = express.Router()

const { errorHandling } = require("./src/common/error")

const server = createServer(app)
const io = new Server(server)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(httpLogger)
app.use(cors())

app.get("/test", (req, res) => {
    res.sendFile(`${__dirname}/src/index.html`)
})

// Check jwt for protectedRouter
protectedRouter.use((req, res, next) => {
    try {
        const { headers } = req
        const { authorization } = headers

        const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

        const jwt = new JWT()

        const { isValid, decoded } = jwt.verifyTokenFromRequest(authorization)
        if (!isValid) {
            return res.status(422).send("Not Authorized!")
        }

        req.user = { id: decoded.data.id }

        next()
    } catch (e) {
        console.log(e)
        return res.status(422).send("Not Authorized!")
    }
})

io.use((socket, next) => {
    const { token } = socket.handshake.query
    try {
        const jwt = new JWT()
        const { isValid, decoded } = jwt.verifyTokenFromRequest(token)

        if (!isValid) throw new Error("Invalid token")
        
        socket.user = { id: decoded.data.id }
        classRegistry
            .get("User")
            .repo.getDriverById({ userId: decoded.data.id })
            .then(([err, user]) => {
                socket.user.role = user ? "driver" : "user"
                next()
            })
    } catch (e) {
        console.log(e)
        socket.disconnect()
    }
})

function registerEventListenerIfAbsent(eventName, eventFunction) {
    console.log(123)
    if (!process.listeners(eventName).some((listener) => listener.toString() === eventFunction.toString())) {
        process.on(eventName, eventFunction)
    }
}

io.on("connection", async (socket) => {
    socket.emit("connected", { connected: true })
    let orderCreatedByUserEvent

    if (socket.user.role === "driver") {
        process.on('order: created', () => {
            socket.emit('order: created')
        })
        process.on('order: accepted', () => {
            socket.emit('order: accepted')
        })
        process.on('order: started', () => {
            socket.emit('order: started')
        })
        process.on('order: finished', () => {
            socket.emit('order: finished')
        })
    }

    if (socket.user.role === "user") {
        process.on(`${socket.user.id}.order: accepted`, () => {
            socket.emit('order: accepted')
        })
        process.on(`${socket.user.id}.order: started`, () => {
            socket.emit('order: started')
        })
        process.on(`${socket.user.id}.order: ended`, () => {
            socket.emit('order: ended')
        })
        process.on(`${socket.user.id}.order: finished`, () => {
            socket.emit('order: finished')
        })
    }

    const handleNotification = (data) => {
        notificationHandler(socket, data)
    }

    socket.on("ready for data", () => {
        client.on("notification", handleNotification)
    })
    socket.on("messageSeen", (data) => {
        io.sockets.emit("messageSeen", data)
    })

    socket.on("disconnect", () => {
        process.removeAllListeners("order: created")
        process.removeAllListeners("order: accepted")
        process.removeAllListeners("order: started")
        process.removeAllListeners("order: finished")
    })
})

const User = new UserModule(io, server, router, protectedRouter, adminRouter, db)
const Auth = new AuthModule(router, protectedRouter, db, bcrypt)
const Order = new OrderModule(router, protectedRouter, adminRouter, db)
const Payment = new PaymentModule(router, protectedRouter, adminRouter, db)
const Dispatcher = new DispatcherModule(router, protectedRouter, db, bcrypt)

classRegistry.register("Auth", Auth)
classRegistry.register("User", User)
classRegistry.register("Order", Order)
classRegistry.register("Payment", Payment)
classRegistry.register("Dispatcher", Dispatcher)

app.use("/", router)
app.use("/", protectedRouter)

app.use(errorHandling)

server.listen(config.port, () => {
    logger.info(`Service is listening on port: ${config.port}`)
})