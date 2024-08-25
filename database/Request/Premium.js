const PremiumScheme = require("../Schema/premium");
const { Temporal } = require("@js-temporal/polyfill");
const Pay = require("./PayPremium");

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
    let correntDate = await getCurrentDateInMSK();
    console.log("Текущие подписки:", correntDate.toString());
    let findCurrentPremium = await PremiumScheme.find({
      nextTimePay: correntDate,
    });
    if (findCurrentPremium == []) return false;
    for (const item of findCurrentPremium) {
      if (item.saved) {
        let pay = await Pay(
          item.amount,
          item.paymentId,
          item.userID,
          getNextDateInDays(item.typePremium)
        );
        console.log("Оплата подписки:", pay);
        return;
      }
      let removePremium = await PremiumScheme.findOneAndDelete({
        userID: item.userID,
      });
      console.log("Удаляем подписку:", removePremium);
    }
    console.log("Текущие подписки:", findCurrentPremium);
    return true;
  } catch (e) {
    console.error("Ошибка при удалении подписок:", e);
    return false;
  }
};

module.exports = removePremium;
