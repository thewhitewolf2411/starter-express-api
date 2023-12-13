const { createDb, migrate } = require("postgres-migrations")
const { Client } = require("pg")

const filePath = process.env.MIGRATIONS_PATH

const dbConfig = {
  database: process.env.DB_DATABASE || "tx",
  host: process.env.DB_HOST || "tx",
  user: process.env.DB_USER || "tx",
  password: process.env.DB_PASSWORD || "tx",
  port: parseInt(process.env.DB_PORT) || 5432,
}

const dropMigrations = async () => {
  const client = new Client(dbConfig)

  await client.connect()
  console.log("Dropping migrations table")
  await client.query("DROP TABLE IF EXISTS migrations;")
  await client.end()
}

const runDbPatches = async () => {
  if (process.env.IS_DEV) await dropMigrations()

  try {
    await createDb(dbConfig.database, dbConfig)

    await migrate(dbConfig, filePath)
    console.log("Migrations done")
  } catch (e) {
    console.log(e)
  }
}

runDbPatches()
