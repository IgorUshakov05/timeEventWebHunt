const axios = require("axios");
const { v4 } = require("uuid");
const Pay = async (amuntValue, paymentMethodId, userID, nextTimePay) => {
  const idempotenceKey = v4();
  try {
    const response = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      {
        amount: {
          value: amuntValue,
          currency: "RUB",
        },
        capture: true,
        payment_method_id: paymentMethodId,
        description: "Автоплатеж - Премиум",
        metadata: {
          userId: userID,
          paymentType: "premium-update",
          nextTimePay,
        },
      },
      {
        auth: {
          username: process.env.SHOPID,
          password: process.env.SECRETKEY,
        },
        headers: {
          "Idempotence-Key": idempotenceKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Payment response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Error response from server:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up the request:", error.message);
    }
    throw error;
  }
};

module.exports = Pay;
