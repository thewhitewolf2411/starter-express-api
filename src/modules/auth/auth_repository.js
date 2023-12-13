const { WithLogger } = require("@common/classes")
const convertToCamelCase = require("@common/utils/convertToCamelCase")

class AuthRepository extends WithLogger {
  constructor(db) {
    super()
    this.db = db
  }

  async logoutUser(token, decoded) {
    const query = {
      text: 'INSERT INTO "user".blacklisted_tokens(token, expires) VALUES($1, to_timestamp($2))',
      values: [token, decoded.exp],
    }

    await this.db.query(query)
    return true
  }

  async logUserLogin(userId, timeZone) {
    const query = `INSERT INTO log.login (user_id, time_zone)
                   VALUES ('${userId}', '${timeZone || ""}')`

    await this.db.query(query)
    return true
  }

  async verifyBlacklistToken(token) {
    const query = {
      text: 'select exists(select true from "user".blacklisted_tokens where token=$1)',
      values: [token],
    }

    const { rows } = await this.db.query(query)
    const { exists } = convertToCamelCase(rows).shift()

    return exists
  }
}

module.exports = AuthRepository
