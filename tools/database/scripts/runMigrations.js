const { createDb, migrate } = require("postgres-migrations")
const { Client } = require("pg")

const filePath = "../../../migrations"

const dbConfig = {
  database: process.env.DB_DATABASE || "taxi",
  host: process.env.DB_HOST || "ep-steep-poetry-48615223.us-east-2.aws.neon.tech",
  user: process.env.DB_USER || "PavaoZornija1",
  password: process.env.DB_PASSWORD || "Gxoy6OqwiP1n",
  port: parseInt(process.env.DB_PORT) || 5432,
  sslmode: 'require'
}

const config = {
  sslmode: 'require',
  debug: true
}

const connectionString = 'postgresql://PavaoZornija1:Gxoy6OqwiP1n@ep-steep-poetry-48615223.us-east-2.aws.neon.tech/taxi?sslmode=require'

const dropMigrations = async () => {
  const client = new Client({connectionString})

  await client.connect()
  console.log("Dropping migrations table")
  await client.query("DROP TABLE IF EXISTS migrations;")
  await client.end()
}

const runDbPatches = async () => {
  if (process.env.IS_DEV) await dropMigrations()

  try {
    const client = new Client({ connectionString })

    await client.connect()
    //await createDb(dbConfig.database, dbConfig, config)

    await migrate({client}, filePath)
    console.log("Migrations done")
    await client.end()
  } catch (e) {
    console.log(e, e.message)
  }
}

runDbPatches()
