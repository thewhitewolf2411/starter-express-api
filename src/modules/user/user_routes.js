const multer = require('multer')
class UserRoutes {
  constructor(router, protectedRouter, adminRouter, handlers, middleware) {
    this.router = router
    this.protected = protectedRouter
    this.adminRouter = adminRouter
    this.handlers = handlers
    this.middleware = middleware
    this.storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, '../../../tmp/');
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      }
    });

    const upload = multer({
      storage: this.storage
    }).single("image");

    this.protected
      .route("/users/:userId")
      .get((req, res, next) => this.handlers.getUserByIdHandler(req, res).catch(next))


    this.protected
      .route("/user")
      .get((req, res, next) => this.handlers.getUserByIdHandler(req, res).catch(next))
      .put((req, res, next) => this.handlers.updateUserHandler(req, res).catch(next))

    this.protected
      .route("/user/image")
      .post(upload, (req, res, next) => this.handlers.uploadUserImage(req, res).catch(next))

    this.protected
      .route("/driver/:driverId/review")
      .get((req, res, next) => this.handlers.getDriverReviews(req, res).catch(next))
      .post((req, res, next) => this.handlers.postDriverReview(req, res).catch(next))
  }
}

module.exports = UserRoutes
