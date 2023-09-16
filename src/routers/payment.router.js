// paymentRouter.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');

// Route for initiating a payment
router.post('/initiate-payment', paymentController.initiatePayment);

// Route for handling PhonePe payment callback
router.post('/phonepe-callback', paymentController.handleCallback);

// route for handling payment status
router.get('/payment-status/:transactionId', paymentController.chechPaymentStatus);

//route for handling refund callback
router.post('/phonepe-refund-callback', paymentController.refundCallBack);

module.exports = router;
