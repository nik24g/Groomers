const { verifySignature, razorpay } = require('../../utils/razorpay.util'); // Implement signature verification in util

// Handle Razorpay webhook
const handleWebhook = async (req, res) => {
  const payload = req.body;
  // Verify the signature
  const isValidSignature = verifySignature(req.body, req.headers['x-razorpay-signature']);
  if (!isValidSignature) {
    console.error('Invalid Razorpay signature');
    return res.status(400).send('Bad Request');
  }

  // Verify the payment status
  if (payload.status === 'captured') {
    // Payment is successful, update your database here
    // Respond to Razorpay
    res.status(200).send('Webhook Received and payment is captured');
  } else {
    // Payment failed, handle accordingly
    res.status(400).send('Payment Failed');
  }
};

module.exports = {
  handleWebhook,
};
