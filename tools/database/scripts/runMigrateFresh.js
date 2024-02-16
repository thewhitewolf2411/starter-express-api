const { createDb, migrate } = require("postgres-migrations");
const { Client } = require("pg");

const filePath = "../../../migrations";

const dbConfig = {
    database: process.env.DB_DATABASE || "taxi",
    host: process.env.DB_HOST || "ep-steep-poetry-48615223.us-east-2.aws.neon.tech",
    user: process.env.DB_USER || "PavaoZornija1",
    password: process.env.DB_PASSWORD || "Gxoy6OqwiP1n",
    port: parseInt(process.env.DB_PORT) || 5432,
    sslmode: 'require'
};

const connectionString = 'postgresql://PavaoZornija1:Gxoy6OqwiP1n@ep-steep-poetry-48615223.us-east-2.aws.neon.tech/taxi?sslmode=require';

const dropSchema = async () => {
    try {
        const client = new Client({ connectionString });
        await client.connect();

        console.log("Dropping schema...");

        // Drop all tables and their associated objects
        await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");

        console.log("Schema dropped successfully");

        await client.end();
    } catch (error) {
        console.error("Error while dropping schema:", error);
    }
};

const runDbMigrations = async () => {
    try {
        await dropSchema();

        const client = new Client({ connectionString });
        await client.connect();

        console.log("Running migrations...");
        await migrate({ client }, filePath);
        console.log("Migrations done");

        await client.end();
    } catch (error) {
        console.error("Error during migration:", error);
    }
};

runDbMigrations();
