// paymentRouter.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');

// Route for initiating a payment
router.post('/initiate-payment', paymentController.initiatePayment);

// Route for handling PhonePe callback
router.post('/phonepe-callback', paymentController.handleCallback);

router.post('/status', paymentController.chechPaymentStatus);

module.exports = router;
