const PremiumScheme = require("../Schema/premium");
const { Temporal } = require("@js-temporal/polyfill");
const sendWebPush = require("../../web-push/push");
const { getUserEndpoint } = require("./WebPush");
const Pay = require("./PayPremium");
const { EndSubNotification } = require("./SubscriptionNotification");

function getCurrentDateInMSK() {
  return Temporal.Now.plainDateISO();
}
function getNextDateInDays(typePremium) {
  const now = Temporal.Now.plainDateISO();
  let nextDate;

  switch (typePremium) {
    case "Шорт":
      nextDate = now.add({ months: 1 });
      break;
    case "Миддл":
      nextDate = now.add({ months: 3 });
      break;
    case "Лонг":
      nextDate = now.add({ years: 1 });
      break;
    default:
      throw new Error("Invalid typePremium value");
  }

  return nextDate;
}

const removePremium = async () => {
  try {
    let currentDate = await getCurrentDateInMSK().toString();
    console.log("Текущие подписки:", currentDate);

    let findCurrentPremium = await PremiumScheme.find({
      nextTimePay: currentDate,
    });
    if (findCurrentPremium.length === 0) {
      return false;
    }

    const failedPayments = [];

    const paymentPromises = findCurrentPremium.map(async (item) => {
      if (item.saved) {
        try {
          const pay = await Pay(
            item.amount,
            item.paymentId,
            item.userID,
            getNextDateInDays(item.typePremium)
          );
          console.log("Оплата подписки:", pay);
          sendWebPushOnMainServer(
            "Автопродление подписки",
            "Подписка была продлена",
            item.userID
          );
        } catch (error) {
          console.error(
            "Ошибка при оплате подписки для пользователя:",
            item.userID
          );
          let createEndNotification = await EndSubNotification(item.userID);
          sendWebPushOnMainServer(
            "Не удалось продлить подписку",
            "Оформить подписку снова?",
            item.userID
          );

          failedPayments.push(item.userID);
        }
      }

      const removePremium = await PremiumScheme.deleteMany({
        userID: failedPayments,
      });
      console.log("Удаляем подписку:", removePremium);
    });

    await Promise.all(paymentPromises);

    if (failedPayments.length > 0) {
      console.log("Не удалось оплатить следующие подписки:", failedPayments);
    }

    return true;
  } catch (e) {
    console.error("Ошибка при удалении подписок:", e);
    return false;
  }
};

const sendWebPushOnMainServer = (title, text, userID) => {
  fetch(`${process.env.MAIN_SERVER}/notification/send-notification/${userID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: process.env.API_KEY_WEBPSUH,
    },
    body: JSON.stringify({ title, text }),
  })
    .then((obj) => obj.json())
    .then((data) => console.log(data, "данные"))
    .catch((error) => console.error("Error:", error));
};

module.exports = removePremium;
