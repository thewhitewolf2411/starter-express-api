const db = require("@common/db")

class Transaction {
  isStarted = false

  queryText = ""

  client = null

  isolationLevel

  /**
   * @param {TransactionIsolation?} isolationLevel - isolation level of transcription
   */
  constructor(isolationLevel) {
    this.isolationLevel = isolationLevel
    this.pool = db.pool
  }

  async begin() {
    try {
      this.client = await this.pool.connect()
      await this.client.query("BEGIN")
      this.isStarted = true
      if (this.isolationLevel) {
        await this.client.query(`SET TRANSACTION ISOLATION LEVEL ${this.isolationLevel}`)
      }
    } catch (e) {
      await this.#handleError(e)
    }
  }

  async launch() {
    if (!this.queryText) return
    await this.begin()
    await this.query(this.queryText)
    await this.commit()
  }

  addQueryText(text) {
    this.queryText += `${text};\n`
  }

  async query(query, isLast) {
    if (!this.isStarted) await this.begin()
    try {
      const response = await this.client.query(query)
      if (isLast) await this.commit()
      return response
    } catch (e) {
      await this.#handleError(e)
    }
  }

  async commit() {
    try {
      if (!this.isStarted) return
      await this.client.query("COMMIT")
      this.client.release()
      this.isStarted = false
      this.queryText = ""
    } catch (e) {
      await this.#handleError(e)
    }
  }

  async rollback() {
    if (!this.isStarted) return
    this.isStarted = false
    this.queryText = ""
    await this.client.query("ROLLBACK")
    this.client.release()
  }

  async #handleError(e) {
    await this.rollback()
    throw e
  }
}

module.exports = Transaction
