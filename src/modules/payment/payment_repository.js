/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
const uuid = require("../../common/utils/uuid")
const convertToCamelCase = require("../../common/utils/convertToCamelCase")

class PaymentRepository {
    constructor(db) {
        this.db = db
    }

    async orderPaid({ orderId }) {
        const updateQuery = {
            text: `UPDATE "user".orders
             SET is_successful_payment = $2, ride_ended = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            values: [
                orderId,
                true,
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

module.exports = PaymentRepository