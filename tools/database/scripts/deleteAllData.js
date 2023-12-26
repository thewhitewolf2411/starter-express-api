const { Client } = require("pg");

const dbConfig = {
    database: process.env.DB_DATABASE || "taxi",
    host: process.env.DB_HOST || "ep-steep-poetry-48615223.us-east-2.aws.neon.tech",
    user: process.env.DB_USER || "PavaoZornija1",
    password: process.env.DB_PASSWORD || "Gxoy6OqwiP1n",
    port: parseInt(process.env.DB_PORT) || 5432,
    sslmode: 'require'
}

const connectionString = 'postgresql://PavaoZornija1:Gxoy6OqwiP1n@ep-steep-poetry-48615223.us-east-2.aws.neon.tech/taxi?sslmode=require'

const truncateUserSchema = async () => {
    const client = new Client({ connectionString });

    try {
        await client.connect();

        // List all tables in the "user" schema
        const result = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'user';");
        const tables = result.rows.map(row => row.table_name);

        // Truncate each table in the "user" schema to delete all data
        for (const table of tables) {
            await client.query(`TRUNCATE TABLE "user"."${table}" RESTART IDENTITY CASCADE;`);
            console.log(`Data deleted from table: user.${table}`);
        }

        console.log("All data deleted from tables in the 'user' schema.");

        // Insert data into the "ride_status" table
        await client.query(`
            INSERT INTO "user".ride_status (name) VALUES
              ('Created'),
              ('Accepted'),
              ('Started'),
              ('Ended');
        `);

        console.log("Inserted data into Ride status");
    } catch (e) {
        console.error("Error deleting data:", e.message);
    } finally {
        await client.end();
    }
}

truncateUserSchema();