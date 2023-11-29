// paymentRouter.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');
const tokenAuthentication = require("../middleware/users/verifyToken")

// Route for initiating a payment
router.post('/initiate-payment', tokenAuthentication, paymentController.initiatePayment);

// Route for handling PhonePe payment callback
router.post('/phonepe-callback', paymentController.handleCallback);

// route for handling payment status
router.get('/payment-status/:transactionId', tokenAuthentication, paymentController.chechPaymentStatus);

//route for handling refund callback
router.post('/phonepe-refund-callback', paymentController.refundCallBack);

module.exports = router;
//developed by Nitin Goswami
// Hope so this payment gateway working fine :)
// nitingoswami1900@gmail.com
