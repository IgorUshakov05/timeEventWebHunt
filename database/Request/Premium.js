const PremiumScheme = require("../Schema/premium");
const { Temporal } = require("@js-temporal/polyfill");
const { DateTime } = require("luxon");
const Pay = require("./Pay");

function getCurrentDateInMSK() {
  const nowInMoscow = DateTime.now().setZone("Europe/Moscow");
  return nowInMoscow.toFormat("dd.MM.yyyy");
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

  // Преобразуем дату в формат дд.мм.гггг
  const formattedDate = `${String(nextDate.day).padStart(2, "0")}.${String(
    nextDate.month
  ).padStart(2, "0")}.${nextDate.year}`;

  return formattedDate;
}

const removePremium = async () => {
  try {
    let correntDate = await getCurrentDateInMSK();
    let findCurrentPremium = await PremiumScheme.find({
      nextTimePay: correntDate,
    });
    if (findCurrentPremium == []) return false;
    for (const item of findCurrentPremium) {
      if (item.save) {
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
