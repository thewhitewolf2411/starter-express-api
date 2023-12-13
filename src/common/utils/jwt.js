const jwt = require("jsonwebtoken")

const { WithLogger } = require("@common/classes")
const config = require("@config")

const { pubKey, privKey, jwtIssuer, jwtAudience } = config

// Possible to initialize class with issuer and audience
// for convenience it has default values read from a config file
class JWT extends WithLogger {
  constructor({ issuer = jwtIssuer, audience = jwtAudience } = {}) {
    super()
    this.issuer = issuer
    this.audience = audience

    this.verifyOptions = {
      issuer,
      audience,
      expiresIn: "12h",
      algorithm: ["RS256"],
    }
  }

  signKey(payload) {
    const signingOptions = {
      issuer: this.issuer,
      audience: this.audience,
      expiresIn: "99999h",
    }

    try {
      return jwt.sign({ data: payload }, pubKey, signingOptions)
    } catch (e) {
      throw { status: 500, error: e }
    }
  }

  verifyTokenFromRequest(authToken) {
    try {
      if (!authToken) {
        throw { status: 422, error: "No Authorization header set!" }
      }
      const token = authToken.split(" ").pop()

      const decoded = jwt.verify(token, pubKey, this.verifyOptions)

      return { isValid: true, decoded }
    } catch (e) {
      return { isValid: false }
    }
  }
}

module.exports = JWT
