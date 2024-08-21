const PremiumScheme = require("../Schema/premium");
const UserScheme = require("../Schema/UserSchema");
const { DateTime } = require("luxon");

// Функция для получения текущей даты по московскому времени
function getCurrentDateInMSK() {
  const nowInMoscow = DateTime.now().setZone("Europe/Moscow");
  const formattedDate_dd_mm_yyyy = nowInMoscow.toFormat("dd.MM.yyyy");
  return formattedDate_dd_mm_yyyy;
}

const removePremium = async () => {
  try {
    let currentDate = getCurrentDateInMSK();
    let findAllPremium = await PremiumScheme.find();
    console.log(findAllPremium);
    let deletedPremium = await PremiumScheme.deleteMany({
      nextTimePay: currentDate,
    });
    console.log(deletedPremium);
    return true;
  } catch (e) {
    console.error("Ошибка при удалении подписок:", e);
    return false;
  }
};

module.exports = removePremium;
