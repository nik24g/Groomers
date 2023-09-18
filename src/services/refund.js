const crypto = require('crypto');
const Buffer = require('buffer').Buffer;

const refund = async (userId, originalTransactionId, merchantTransactionId, amount) => {
    const payload = {
        "merchantId": process.env.MARCHANT_ID,
        "merchantUserId": userId,
        "originalTransactionId": originalTransactionId,
        "merchantTransactionId": merchantTransactionId,
        "amount": amount * 100,
        "callbackUrl": process.env.PG_REFUND_CALLBACK_URL
    }
    const saltKey = process.env.PG_SALT_KEY;
    const saltIndex = process.env.PG_SALT_INDEX;
    // Convert the payload to a JSON string and base64 encode it
    const payloadString = JSON.stringify(payload);
    const base64EncodedPayload = Buffer.from(payloadString).toString('base64');
    // Concatenate the components
    const concatenatedString = base64EncodedPayload + '/pg/v1/refund' + saltKey;
    // Hash the concatenated string using SHA-256
    const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');
    // Combine the hash, "###", and salt index to create the X-VERIFY header
    const xVerifyHeader = hash + '###' + saltIndex;
    const url = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund';
    const options = {
        method: 'POST',
        headers: { accept: 'application/json', 'Content-Type': 'application/json', "X-VERIFY": xVerifyHeader },
        body: JSON.stringify({ "request": base64EncodedPayload })
    };

    let refundData = await fetch(url, options)
    refundData = await refundData.json()
    return refundData

}
module.exports = { refund }