const Vacancy = require("../Schema/Vakancy");
const { v4 } = require("uuid");
const { Temporal } = require("@js-temporal/polyfill");

function getCurrentDateInMSK() {
  return Temporal.Now.plainDateISO();
}

let findVacancyForDelete = async () => {
  console.log(getCurrentDateInMSK().toString());
  let currentDate = await getCurrentDateInMSK();
  return Vacancy.deleteMany({ dateAndTimeCreated: currentDate });
};

module.exports = { findVacancyForDelete };
