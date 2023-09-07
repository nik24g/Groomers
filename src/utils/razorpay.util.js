const Razorpay = require('razorpay');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')

const razorpay = new Razorpay({
  key_id: 'rzp_test_3NvS1A0AXxl3iE',
  key_secret: 'IwgWYQlKuda9SgiQim7VwWa2',
});

const createOrder = async (amount, orderId) => {
  const orderData = {
    amount: amount * 100, // Amount in paise (e.g., 10000 paise = 100 INR)
    currency: 'INR',
    receipt: orderId,
    payment_capture: 1, // Automatically capture payment when created
  };

  try {
    const order = await razorpay.orders.create(orderData);
    // Send the order details to your frontend for payment processing
    return order
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Verify Razorpay signature
const verifySignature = (payload, signature) => {
  return validateWebhookSignature(JSON.stringify(payload), signature, "nitin123")
  // return razorpay.webhooks.verify(payload, signature, "nitin123");
};

module.exports = { createOrder, verifySignature, razorpay };
