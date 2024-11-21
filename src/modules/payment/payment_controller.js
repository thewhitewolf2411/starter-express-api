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

        this.repo.orderPaid({ orderId })

        res.status(200).send({message: "ok"})

        /* const data = {
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
        })(); */
    }

    async createPaymentIntentHandler(req, res){

        const { rideId: orderId } = req.params

        const order = await classRegistry.get("Order").getOrderById(orderId)

        const { exactPrice, customerId } = order

        const [err, user] = await classRegistry.get("User").getUserById({userId: customerId})
 
        try {
            const { firstName, lastName, email, phoneNumber } = user

            const orderNumber = "0cba9a96aec4f8c"
            const amount = exactPrice * 100

            const requestBody = JSON.stringify({
                "transaction_type": "purchase",
                "amount": amount,
                "currency": "BAM",
                "order_number": orderNumber,
                "order_info": "Taxi Order",
                "language": ["bs"],
                "ch_full_name": firstName + " " + lastName,
                "ch_address": "",
                "ch_city": "",
                "ch_zip": "",
                "ch_country": "BH",
                "ch_phone": phoneNumber,
                "ch_email": email,
                "supported_payment_methods": ["card"],
            })

            const merchantKey = "key-b84363ffa3b6448663f3f9f3dee6ff6a";
            const authenticityToken = "40d23add07f9ddcdb67512ea35e24799b35921e3";
            const monriBaseUrl = "https://ipgtest.monri.com";
            const fullPath = "/v2/payment/new";
            const timestamp = (new Date()).getTime();
    
            // Create digest for Authorization header
            const digest = crypto.createHash('sha512')
                .update(merchantKey + timestamp + authenticityToken + requestBody)
                .digest("hex");
            const authorization = `WP3-v2 ${authenticityToken} ${timestamp} ${digest}`;

            try {
                const response = await fetch(`${monriBaseUrl}${fullPath}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': authorization
                    },
                    body: requestBody
                });

                const result = await response.json();

                console.log(result)

                if (response.ok) {
                    res.status(201).send({ status: 'approved', client_secret: result.client_secret });
                } else {
                    res.status(500).send({ client_secret: null, status: 'declined', error: result });
                }
            } catch (error) {
                console.log("fuck it")
                console.log(error)
            }
        } catch (e) {
            console.log("fuck it twice")
            console.log(e)
        }


        res.status(200)
    }

}

module.exports = PaymentController