require("module-alias/register")

const express = require("express")

const app = express()
const bcrypt = require("bcryptjs")
const cors = require("cors")
const config = require("@config")
const { classRegistry } = require("@common/classes")
const { httpLogger } = require("@common/middlewares")
const logger = require("@common/logger")
const db = require("@common/db")
const JWT = require("@common/utils/jwt")

const AuthModule = require("@modules/auth")
const UserModule = require("@modules/user")
const OrderModule = require("@modules/order")

const protectedRouter = express.Router()
const adminRouter = express.Router()
const router = express.Router()

const { errorHandling } = require("@common/error")

const server = require("http").createServer(app)
const io = require("socket.io").listen(server, { origins: "*:*", path: "/socket" })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(httpLogger)
app.use(cors())

app.get("/test", (req, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

// Check jwt for protectedRouter
protectedRouter.use((req, res, next) => {
    try {
        const { headers } = req
        const { authorization } = headers

        const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        if(fullUrl.includes("socket")) return next()

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

function registerEventListenerIfAbsent(eventName, eventFunction) {
    const existingListeners = process.listeners(eventName);
    const isFunctionRegistered = existingListeners.some((listener) => listener === eventFunction);

    if (!isFunctionRegistered) {
        process.on(eventName, eventFunction);
    }
}

io.on("connection", async (socket) => {
    const orderCreated = `order: created`;

    const eventFunction = (data) => socket.emit(orderCreated, data);
    registerEventListenerIfAbsent(orderCreated, eventFunction);

    socket.emit("connected", { connected: true });

    socket.on('ready for data', (data) => {
        console.log('Client is ready for data:', data);
    });

    socket.on("disconnect", () => {
        process.removeListener(orderCreated, eventFunction);
    });
});

const User = new UserModule(io, server, router, protectedRouter, adminRouter, db)
const Auth = new AuthModule(router, protectedRouter, db, bcrypt)
const Order = new OrderModule(router, protectedRouter, adminRouter, db)

classRegistry.register("Auth", Auth)
classRegistry.register("User", User)
classRegistry.register("Order", Order)

app.use("/", router)
app.use("/", protectedRouter)

app.use(errorHandling)

server.listen(config.port, () => logger.info(`Service is listening on port: ${config.port}`))