/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
const uuid = require("@common/utils/uuid")
const convertToCamelCase = require("@common/utils/convertToCamelCase")

class OrderRepository {
    constructor(db) {
        this.db = db
    }

    async getRidesForUser({ userId }){
        const query = {
            text: `
                SELECT id,
                        customer_id,
                        driver_id,
                        canceled,
                        is_successful_payment,
                        estimated_price,
                        exact_price,
                        created_at,
                        updated_at,
                        start_longitude,
                        start_latitude,
                        end_longitude,
                        end_latitude
                FROM "user".orders
                WHERE customer_id = $1`,
            values: [userId],
        };

        try {
            const { rows } = await this.db.query(query);

            // Convert snake_case to camelCase
            const orders = convertToCamelCase(rows);

            return [null, orders];
        } catch (e) {
            return [e.message, null];
        }
    }

    async createOrder({customerId, estimatedPrice, startLongitude, startLatitude, endLongitude, endLatitude}){
        const createOrderQuery = {
            text: `
                INSERT INTO "user".orders (
                    customer_id,
                    estimated_price,
                    status_id,
                    created_at,
                    updated_at,
                    start_longitude,
                    start_latitude,
                    end_longitude,
                    end_latitude
                ) VALUES (
                    $1, $2, $3, NOW(), NOW(), $4, $5, $6, $7
                ) RETURNING id, customer_id, estimated_price, status_id, created_at, updated_at
            `,
            values: [
                customerId,
                estimatedPrice,
                1,
                startLongitude,
                startLatitude,
                endLongitude,
                endLatitude
            ],
        };

        try {
            const { rows } = await this.db.query(createOrderQuery);

            // Convert snake_case to camelCase
            const newOrder = convertToCamelCase(rows[0]);

            return [null, newOrder];
        } catch (e) {
            return [e.message, null];
        }
    }

    async getCurrentOrder({ customerId }){
        const getCurrentOrderQuery = {
            text: `
                SELECT * FROM "user".orders
                WHERE customer_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            `,
            values: [
                customerId,
            ],
        };

        try {
            const { rows } = await this.db.query(getCurrentOrderQuery);

            const newOrder = convertToCamelCase(rows[0]);

            return [null, newOrder];
        } catch (e) {
            return [e.message, null];
        }
    }
}

module.exports = OrderRepository
