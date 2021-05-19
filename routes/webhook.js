const bodyParser = require("body-parser");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const express = require("express");

const webhookController = require("../controllers/webhook")

const router = express.Router();


router.post('/webhook', bodyParser.raw({type: 'application/json'}), webhookController.postWebhook);

module.exports = router;