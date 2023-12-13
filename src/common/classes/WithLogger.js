const logger = require("../logger")

class WithLogger {
  constructor() {
    this.logger = logger
  }
}

module.exports = WithLogger
