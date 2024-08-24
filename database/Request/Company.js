const CompanySchema = require("../Schema/Company");
const { v4 } = require("uuid");
const { DateTime } = require("luxon");
const { Temporal } = require("@js-temporal/polyfill");
const Pay = require("./PayCompany");

function getCurrentDateInMSK() {
  const nowInMoscow = DateTime.now().setZone("Europe/Moscow");
  return nowInMoscow.toFormat("dd.MM.yyyy");
}
function getNextMonth() {
  const now = Temporal.Now.plainDateISO();
  let nextDate = now.add({ months: 1 });
  const formattedDate = `${String(nextDate.day).padStart(2, "0")}.${String(
    nextDate.month
  ).padStart(2, "0")}.${nextDate.year}`;

  return formattedDate;
}

const removeComapany = async () => {
  try {
    let correntDate = await getCurrentDateInMSK();
    let findCurrentCompany = await CompanySchema.find({
      nextPayDay: correntDate,
      isVarefy: true,
      isFreez: false,
    });
    if (findCurrentCompany == []) return false;
    for (const item of findCurrentCompany) {
      if (item.isAutoPay) {
        let pay = await Pay(
          item.countStaffs,
          item.paymentId,
          item.creatorID,
          getNextMonth()
        );
        console.log("Оплата премиум:", pay);
        return;
      }
      let freezCompany = await CompanySchema.findOneAndUpdate(
        {
          creatorID: item.creatorID,
        },
        {
          isFreez: true,
        }
      );
      console.log("Заморозка компании:", freezCompany);
    }
    console.log("Текущие подписки:", findCurrentCompany);
    return true;
  } catch (e) {
    console.error("Ошибка при удалении подписок:", e);
    return false;
  }
};

module.exports = removeComapany;
