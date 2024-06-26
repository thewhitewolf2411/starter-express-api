const { WithLogger } = require("../../common/classes")
const UserRoutes = require("./user_routes")
const UserController = require("./user_controller")
const UserRepo = require("./user_repository")
const UserMiddleware = require("./user_middleware")

class UserInterface extends WithLogger {
  constructor(io, server, router, protectedRouter, adminRouter, db) {
    super()
    this.io = io,
    this.server = server
    this.router = router
    this.protectedRouter = protectedRouter
    this.adminRouter = adminRouter
    this.db = db

    this.repo = new UserRepo(this.db)
    this.middleware = new UserMiddleware(this.repo)
    this.handlers = new UserController(this.repo, this.server)
    this.routes = new UserRoutes(this.router, this.protectedRouter, this.adminRouter, this.handlers, this.middleware)
  }

  async addTaxiUser({ email, firstName, lastName, phoneNumber, password }){
    let err
    let user

    ;[err, user] = await this.repo.addTaxiUser({ email, firstName, lastName, phoneNumber, password })

    if (err) {
      throw err
    }

    user = {
      ...user,
    }

    return user
  }

  async addDriverUser({ email, firstName, lastName, phoneNumber, password, carModel, carNumber, shortDesc, longDesc }) {
    let err
    let user

      ;[err, user] = await this.repo.addDriverUser({ email, firstName, lastName, phoneNumber, password, carModel, carNumber, shortDesc, longDesc })

    if (err) {
      throw err
    }

    user = {
      ...user,
    }

    return [err, user]
  }

  async userByEmailAndPassword({email, password}){
    let err
    let user

      ;[err, user] = await this.repo.userByEmailAndPassword({ email, password })

    if (err) {
      throw err
    }

    user = {
      ...user,
    }

    return user
  }

  async userByEmail({email}){
  
    const [, user] = await this.repo.userByEmail({ email })

    return [null, user]
  }

  async getUserById({ userId }) {

    const [, user] = await this.repo.getUserById({ userId })

    return [null, user]
  }

  async getDriverById({ userId }) {
    const [, driver] = await this.repo.getDriverById({ userId })

    return [null, driver]
  }

}

module.exports = UserInterface
