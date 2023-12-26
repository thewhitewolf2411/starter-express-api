/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
const uuid = require("../../common/utils/uuid")
const convertToCamelCase = require("../../common/utils/convertToCamelCase")

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
                ) RETURNING *
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
                AND canceled = $2
                ORDER BY created_at DESC
                LIMIT 1
            `,
            values: [
                customerId,
                false
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

    async cancelCurrentOrder({ orderId }){
        const cancelCurrentOrderQuery = {
            text: `UPDATE "user".orders
             SET canceled = $1
             WHERE id = $2
             RETURNING *`,
            values: [
                true,
                orderId
            ],
        };

        try {
            const { rows } = await this.db.query(cancelCurrentOrderQuery);

            const newOrder = convertToCamelCase(rows[0]);

            return [null, newOrder];
        } catch (e) {
            return [e.message, null];
        }
    }

    async getActiveOrders(){
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
                end_latitude,
                status_id
                FROM "user".orders
                WHERE status_id = 1;`
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

    async acceptActiveOrder({ orderId, driverId }){
        // Update user based on ID
        const updateQuery = {
            text: `UPDATE "user".orders
             SET driver_id = $2, status_id = $3
             WHERE id = $1
             RETURNING *`,
            values: [
                orderId,
                driverId,
                3,
            ],
        };

        const { rows: updateRows } = await this.db.query(updateQuery);
        const updatedUserResult = convertToCamelCase(updateRows[0]);
    }
}

module.exports = OrderRepository
