const AppointmentModel = require("../models/client/appointment.model")
const PaymentModel = require("../models/users/payment.model")
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Buffer = require('buffer').Buffer;
async function initiatePayment(price, appointmentId, userId) {
    // Define your payload, salt key, and salt index
    const payload = {
        "merchantId": "MERCHANTUAT",
        "merchantTransactionId": appointmentId,
        "merchantUserId": userId,
        "amount": price * 100,
        "redirectUrl": "https://www.groomer.live",
        "redirectMode": "REDIRECT",
        "callbackUrl": "http://3.108.227.136/payment/phonepe-callback",
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

function handleCallback(res, res) {
    // Handle the PhonePe callback to update the payment status
    // Verify the callback's authenticity (signature, etc.)
    // Update your database with the payment status
    const paymentData = new PaymentModel({payment_uuid: uuidv4(), payment_payload: req.body})
    console.log("here we go in hadle call back");
    res.sendStatus(200); // Respond with a success status
}

module.exports = {
    initiatePayment,
    handleCallback
};
