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

    async createOrder({customerId, estimatedPrice, startLongitude, startLatitude, endLongitude, endLatitude, isPetFriendly, isCardPayment, reminder}){
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
                    end_latitude,
                    pet_friendly,
                    card_payment,
                    reminder
                ) VALUES (
                    $1, $2, $3, NOW(), NOW(), $4, $5, $6, $7, $8, $9, $10
                ) RETURNING *
            `,
            values: [
                customerId,
                estimatedPrice,
                1,
                startLongitude,
                startLatitude,
                endLongitude,
                endLatitude,
                isPetFriendly,
                isCardPayment,
                reminder
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
                AND is_successful_payment = $3
                ORDER BY created_at DESC
                LIMIT 1
            `,
            values: [
                customerId,
                false,
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

    async getCurrentDriverOrder({ driverId }){
        const getCurrentOrderQuery = {
            text: `
                SELECT * FROM "user".orders
                WHERE driver_id = $1
                AND canceled = $2
                AND ride_ended = $3
                ORDER BY created_at DESC
                LIMIT 1
            `,
            values: [
                driverId,
                false,
                null
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
                SELECT o.id,
                o.customer_id,
                o.driver_id,
                o.canceled,
                o.is_successful_payment,
                o.estimated_price,
                o.exact_price,
                o.created_at,
                o.updated_at,
                o.start_longitude,
                o.start_latitude,
                o.end_longitude,
                o.end_latitude,
                o.status_id,
                o.pet_friendly,
                o.card_payment,
                o.reminder,
                u.first_name,
                u.last_name,
                u.phone_number,
                u.email
                FROM "user".orders o
                LEFT JOIN "user".users u ON o.customer_id = u.id
                WHERE o.status_id = 1;`
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

    async getOrderById({orderId}){
        const getQuery = {
            text: `SELECT * FROM "user".orders WHERE id = $1 LIMIT 1`,
            values: [orderId]
        };

        try {
            const { rows: orderRow } = await this.db.query(getQuery);

            if (orderRow.length > 0) {
                const order = convertToCamelCase(orderRow[0]);
                return [null, order];
            } else {
                return [null, null];
            }
        } catch (e) {
            console.error('Error querying order:', e);
            return [e.message, null];
        }
    }

    async acceptActiveOrder({ orderId, driverId }){
        const updateQuery = {
            text: `UPDATE "user".orders
             SET driver_id = $2, status_id = $3
             WHERE id = $1
             RETURNING *`,
            values: [
                orderId,
                driverId,
                2, // need to put 2
            ],
        };

        try {
            const { rows: updateRows } = await this.db.query(updateQuery);

            if (updateRows.length > 0) {
                const order = convertToCamelCase(updateRows[0]);
                return [null, order];
            } else {
                return [null, null];
            }
        } catch (e) {
            console.error('Error querying order:', e);
            return [e.message, null];
        }
    }

    async startActiveOrder({ orderId }) {
        const updateQuery = {
            text: `UPDATE "user".orders
             SET status_id = $2
             WHERE id = $1
             RETURNING *`,
            values: [
                orderId,
                3, // need to put 3
            ],
        };

        try {
            const { rows: updateRows } = await this.db.query(updateQuery);

            if (updateRows.length > 0) {
                const order = convertToCamelCase(updateRows[0]);
                return [null, order];
            } else {
                return [null, null];
            }
        } catch (e) {
            console.error('Error querying order:', e);
            return [e.message, null];
        }
    }

    async endActiveOrder({ orderId }) {
        const updateQuery = {
            text: `UPDATE "user".orders
             SET status_id = $2
             WHERE id = $1
             RETURNING *`,
            values: [
                orderId,
                4, // need to put 3
            ],
        };

        try {
            const { rows: updateRows } = await this.db.query(updateQuery);

            if (updateRows.length > 0) {
                const order = convertToCamelCase(updateRows[0]);
                return [null, order];
            } else {
                return [null, null];
            }
        } catch (e) {
            console.error('Error querying order:', e);
            return [e.message, null];
        }
    }

    async setOrderAsFinished({ orderId, isPaid, exactPrice }){
        const updateQuery = {
            text: `UPDATE "user".orders
             SET is_successful_payment = $2, exact_price = $3, ride_ended = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            values: [
                orderId,
                isPaid,
                exactPrice
            ],
        };

        try {
            const { rows: updateRows } = await this.db.query(updateQuery);

            if (updateRows.length > 0) {
                const order = convertToCamelCase(updateRows[0]);
                return [null, order];
            } else {
                return [null, null];
            }
        } catch (e) {
            console.error('Error querying order:', e);
            return [e.message, null];
        }
    }
}

module.exports = OrderRepository
