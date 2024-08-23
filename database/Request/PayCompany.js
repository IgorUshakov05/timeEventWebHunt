const axios = require("axios");
const { v4 } = require("uuid");
let tariff = {
  5: 349,
  20: 1260,
  50: 2800,
  100: 4900,
  200: 9900,
};
const Pay = async (amuntValue, paymentMethodId, userID, nextTimePay) => {
  const idempotenceKey = v4();
  try {
    const response = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      {
        amount: {
          value: tariff[amuntValue],
          currency: "RUB",
        },
        capture: true,
        payment_method_id: paymentMethodId,
        description: "Автоплатеж - компания",
        metadata: {
          creatorID: userID,
          paymentType: "company-update",
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
