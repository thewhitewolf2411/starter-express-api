const Joi = require("@hapi/joi")
const fs = require("fs")
const crypto = require('crypto');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const validation = require("../../common/validation")

const { WithLogger, classRegistry } = require("../../common/classes")
const { ForbiddenError, NotFoundError } = require("../../common/error/errorClasses")
const { ErrorMessages } = require("../../common/error/ErrorMessages");
const config = require("../../../config");

const getRidesForUserPayload = Joi.object().keys({
    userId: Joi.string().required(),
})

class PaymentController extends WithLogger {
    constructor(repo) {
        super()
        this.repo = repo
    }

    async payOrderHandler(req, res){
        const { rideId: orderId } = req.params

        const data = {
            amount: 100, // minor units = 1EUR
            // unique order identifier
            order_number: 'random' + Date.now(),
            currency: 'EUR',
            transaction_type: 'purchase',
            order_info: 'Create payment session order info',
            scenario: 'charge',
            supported_payment_methods: ['67f35b84811188a5c581b063c4f21bd6760c93b2a04d7ac4f8845dd5bbb3f5c6']
        };

        const { MONRI_AUTH_TOKEN: authenticity_token, MONRI_URL_: baseUrl } = config

        const bodyAsString = JSON.stringify(data);
        (async () => {
            const timestamp = Math.floor(Date.now() / 1000);
            const digest = require('crypto').createHash('sha512').update(key + timestamp + authenticity_token + bodyAsString).digest('hex');
            const authorization = `WP3-v2 ${authenticity_token} ${timestamp} ${digest}`;

            try {
                const response = await fetch(`${baseUrl}/v2/payment/new`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorization
                    },
                    body: bodyAsString
                });

                const result = await response.json();

                if (response.ok) {
                    console.log({ status: 'approved', client_secret: result.client_secret });
                } else {
                    console.error({ client_secret: null, status: 'declined', error: result.error });
                }
            } catch (error) {
                console.error({ client_secret: null, status: 'declined', error: error.message });
            }
        })();
    }

}

module.exports = PaymentController