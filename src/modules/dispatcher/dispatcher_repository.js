const { WithLogger } = require("../../common/classes")
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
                FROM "user".user u
                LEFT JOIN "user".driver d ON u.id = d.user_id
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
                FROM "user".user u
                INNER JOIN "user".driver d ON u.id = d.user_id;
            `,
            values: [],
        };

        try {
            const { rows } = await pool.query(query);

            if (rows.length === 0) {
                return ["No drivers found", null];
            }

            const drivers = rows.map(convertToCamelCase);
            return [null, drivers];
        } catch (e) {
            return [e.message, null];
        }
    }
}

module.exports = DispatcherRepository
