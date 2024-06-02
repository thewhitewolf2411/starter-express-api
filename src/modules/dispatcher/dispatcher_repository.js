const { WithLogger } = require("../../common/classes")
const uuid = require("../../common/utils/uuid")
const convertToCamelCase = require("../../common/utils/convertToCamelCase")

class DispatcherRepository extends WithLogger {
    constructor(db) {
        super()
        this.db = db
    }

    async getAdminUser({ email }) {
        const query = {
            text: 'SELECT * FROM "user".admin WHERE email = $1 LIMIT 1',
            values: [email],
        };

        try {
            const { rows } = await this.db.query(query);

            if (rows.length === 0) {
                return ["User not found", null];
            }

            const user = convertToCamelCase(rows[0]);
            return [null, user];
        } catch (e) {
            return [e.message, null];
        }
    }

    async getUsers() {
        const query = {
            text: `
                SELECT u.*
                FROM "user".users u
                LEFT JOIN "user".drivers d ON u.id = d.user_id
                WHERE d.user_id IS NULL;
            `,
            values: [],
        };

        try {
            const { rows } = await this.db.query(query);

            if (rows.length === 0) {
                return [[], null];
            }

            const users = rows.map(convertToCamelCase);
            return [null, users];
        } catch (e) {
            return [e.message, null];
        }
    }

    async getDrivers() {
        const query = {
            text: `
                SELECT u.*, d.*
                FROM "user".users u
                INNER JOIN "user".drivers d ON u.id = d.user_id;
            `,
            values: [],
        };

        try {
            const { rows } = await this.db.query(query);

            if (rows.length === 0) {
                return ["No drivers found", null];
            }

            const drivers = rows.map(convertToCamelCase);
            return [null, drivers];
        } catch (e) {
            return [e.message, null];
        }
    }

    async getOrders() {
        const query = {
            text: `
            SELECT o.*,
            u_customer.*, -- Alias for customer data
            d.*,          -- Driver data
            u_driver.first_name as driver_first_name, u_driver.last_name  as driver_last_name -- Alias for driver data
            FROM "user".orders o
            INNER JOIN "user".users u_customer ON o.customer_id = u_customer.id
            LEFT JOIN "user".drivers d ON o.driver_id = d.user_id
            LEFT JOIN "user".users u_driver ON d.user_id = u_driver.id;
            `,
            values: [],
        };

        try {
            const { rows } = await this.db.query(query);

            if (rows.length === 0) {
                return ["No orders found", null];
            }

            const orders = convertToCamelCase(rows)
            orders.forEach(order => {
                console.log(order.uDriver)
            });
            return [null, orders];
        } catch (e) {
            return [e.message, null];
        }
    }

    async addDriverUser({ email, firstName, lastName, phoneNumber, password, carModel, carNumber, shortDesc, longDesc }) {

        const uid = uuid()

        const insertUserQuery = {
            text: `INSERT INTO "user".users(id, email, first_name, last_name, phone_number, created_at, updated_at, password)
      VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $6)
      ON CONFLICT (email) DO NOTHING RETURNING *;`,
            values: [uid, email, firstName, lastName, phoneNumber, password],
        }

        const insertDriverDataQuery = {
            text: `INSERT INTO "user".drivers(user_id, car_model, car_number, short_desc, long_desc)
      VALUES($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO NOTHING RETURNING *;`,
            values: [uid, carModel, carNumber, shortDesc, longDesc],
        }

        const selectQuery = {
            text: ` SELECT *
      FROM "user".users u
      LEFT JOIN "user".drivers ud ON u.id = ud.user_id
      WHERE u.id = $1 LIMIT 1`,
            values: [uid],
        }

        try {
            // Start a transaction
            await this.db.query('BEGIN');

            // Execute the first INSERT query
            const resultInsertUser = await this.db.query(insertUserQuery);

            // Check if user already exists
            const user = convertToCamelCase(resultInsertUser.rows).shift();
            if (!user) {
                await this.db.query('ROLLBACK');
                return ["User with the provided email already exists", null];
            }

            // Execute the second INSERT query
            const resultInsertUserDetails = await this.db.query(insertDriverDataQuery);


            // Execute the SELECT query
            const resultSelectUserWithDetails = await this.db.query(selectQuery);

            // Commit the transaction if successful
            await this.db.query('COMMIT');

            // Extract the result from the SELECT query
            const driver = convertToCamelCase(resultSelectUserWithDetails.rows).shift();

            // Return both user and user details
            return [null, driver];
        } catch (e) {
            // Rollback the transaction in case of an error
            console.log("here", e)
            await this.db.query('ROLLBACK');
            return [e.message, null];
        } finally {
            // Ensure that the transaction is ended
            await this.db.query('END');
        }
    }
}

module.exports = DispatcherRepository
