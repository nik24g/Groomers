const AppointmentModel = require("../models/client/appointment.model")
const PaymentModel = require("../models/users/payment.model")
const { successResponse, errorResponse } = require("../utils/response");
const messages = require("../utils/constant")
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Buffer = require('buffer').Buffer;
async function initiatePayment(price, appointmentId, userId) {
    // Define your payload, salt key, and salt index
    const payload = {
        "merchantId": process.env.MARCHANT_ID,
        "merchantTransactionId": appointmentId,
        "merchantUserId": userId,
        "amount": price * 100,
        "redirectUrl": "https://nitingoswamiportfolio.netlify.app",
        "redirectMode": "REDIRECT",
        "callbackUrl": "https://www.groomer.live/payment/phonepe-callback",
        "mobileNumber": "7999676443",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    };
    const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const saltIndex = '1';

    // Convert the payload to a JSON string and base64 encode it
    const payloadString = JSON.stringify(payload);
    const base64EncodedPayload = Buffer.from(payloadString).toString('base64');

    // Concatenate the components
    const concatenatedString = base64EncodedPayload + '/pg/v1/pay' + saltKey;

    // Hash the concatenated string using SHA-256
    const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');

    // Combine the hash, "###", and salt index to create the X-VERIFY header
    const xVerifyHeader = hash + '###' + saltIndex;

    console.log('X-VERIFY Header:', xVerifyHeader);

    const url = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
    const options = {
        method: 'POST',
        headers: { accept: 'application/json', 'Content-Type': 'application/json', "X-VERIFY": xVerifyHeader },
        body: JSON.stringify({ "request": base64EncodedPayload })
    };

    let paymentData = await fetch(url, options)
    paymentData = await paymentData.json()
    return paymentData
}

async function handleCallback(req, res) {
    // Handle the PhonePe callback to update the payment status
    // Verify the callback's authenticity (signature, etc.)
    // Update your database with the payment status
    const paymentData = new PaymentModel({ payment_uuid: uuidv4(), payment_payload: `${req.body}` })
    await paymentData.save()
    console.log("here we go in hadle call back");
    res.sendStatus(200); // Respond with a success status
}
const chechPaymentStatus = async (req, res) => {
    const transactionId = req.body.transaction_id
    const merchantId = process.env.MARCHANT_ID;
    const saltKey = '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const saltIndex = '1';

    // Construct the message string
    const message = `/pg/v1/status/${merchantId}/${transactionId}${saltKey}`;

    // Calculate the SHA-256 hash
    const hashResult = crypto.createHash('sha256').update(message).digest('hex');

    // Append the delimiter and salt index
    const xVerifyHeader = `${hashResult}###${saltIndex}`;
    const url = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${process.env.MARCHANT_ID}/${transactionId}`;
    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'Content-Type': 'application/json', 'X-MERCHANT-ID': process.env.MARCHANT_ID, "X-VERIFY": xVerifyHeader}
    };

    let response = await fetch(url, options)
    response = await response.json()
    return res.status(200).json(successResponse(200, messages.success.SUCCESS, response))
}
module.exports = {
    initiatePayment,
    handleCallback,
    chechPaymentStatus
};
