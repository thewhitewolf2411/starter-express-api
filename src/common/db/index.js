const { Pool, Client } = require("pg")
const config = require("@config")
const { WithLogger } = require("../classes")

class DB extends WithLogger {
  constructor(configs) {
    super()
    this.dbConfig = {
      user: configs.dbUser,
      host: configs.dbHost,
      database: configs.dbDatabase,
      password: configs.dbPassword,
      port: Number(configs.dbPort),
    }
    this.pool = new Pool({
      user: configs.dbUser,
      host: configs.dbHost,
      database: configs.dbDatabase,
      password: configs.dbPassword,
      port: Number(configs.dbPort),
      max: 10,
    })
  }

  query(text, params) {
    return this.pool.query(text, params)
  }

  disconnect() {
    return new Promise((resolve) => {
      this.pool.end(() => {
        resolve()
      })
    })
  }

  getClient(callback) {
    this.pool.connect((err, client, done) => {
      const { query } = client

      // monkey patch the query method to keep track of the last query executed
      client.query = (...args) => {
        client.lastQuery = args
        return query.apply(client, args)
      }

      // set a timeout of 5 seconds, after which we will log this client's last query
      const timeout = setTimeout(() => {
        this.logger.error("A client has been checked out for more than 5 seconds!")
        this.logger.error(`The last executed query on this client was: ${client.lastQuery}`)
      }, 5000)

      const release = (err) => {
        // call the actual 'done' method, returning this client to the pool
        done(err)
        // clear our timeout
        clearTimeout(timeout)
        // set the query method back to its old un-monkey-patched version
        client.query = query
      }

      callback(err, client, release)
    })
  }

  async getPgClient() {
    const client = new Client(this.dbConfig)
    await client.connect()

    return client
  }
}

const db = new DB(config)

module.exports = db
