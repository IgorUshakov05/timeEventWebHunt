const CompanySchema = require("../Schema/Company");
const { v4 } = require("uuid");
const { Temporal } = require("@js-temporal/polyfill");
const Pay = require("./PayCompany");

function getCurrentDateInMSK() {
  return Temporal.Now.plainDateISO();
}

function getTimeSixDayAgo() {
  // Получаем текущую дату
  const today = Temporal.Now.plainDateISO();
  // Вычисляем дату 6 дней назад
  const sixDaysAgo = today.subtract({ days: 6 });
  console.log(sixDaysAgo.toString());
  return sixDaysAgo;
}
function getNextMonth() {
  const now = Temporal.Now.plainDateISO();
  let nextDate = now.add({ months: 1 });
  return nextDate;
}

const payComapany = async () => {
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

async function removeOldCompanyRecords() {
  try {
    // Получаем дату 6 дней назад
    const sixDaysAgo = getTimeSixDayAgo();

    // Ищем документы, соответствующие условиям
    const companiesToDelete = await CompanySchema.find({
      nextPayDay: sixDaysAgo,
      isFreez: true,
    });

    // Проверяем, были ли найдены документы
    if (companiesToDelete.length > 0) {
      for (const company of companiesToDelete) {
        const filesToDelete = [
          company.documents[0].certificate_of_state_registration
            .split("/")
            .pop(),
          company.documents[0].tax_registration_certificate.split("/").pop(),
          company.documents[0].egrul_egrip_record_sheet.split("/").pop(),
        ];
        console.log(filesToDelete);
        let deleteFile = await fetch("http://localhost:3001/documtns/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: filesToDelete }),
        });
        let deleteAvatar = await fetch(
          "http://localhost:3001/avatarCompany/remove",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ file: company.avatar.split("/").pop() }),
          }
        );
        let data = await deleteFile.json();
        let dataAvatar = await deleteAvatar.json();
        console.log(data, dataAvatar);
      }
      // Удаляем найденные документы
      await CompanySchema.deleteMany({
        nextPayDay: sixDaysAgo,
        isFreez: true,
      });

      console.log(`${companiesToDelete.length} documents deleted.`);
    } else {
      console.log("No documents found to delete.");
    }
  } catch (error) {
    console.error("Error removing documents:", error);
  }
}

module.exports = { payComapany, removeOldCompanyRecords };
