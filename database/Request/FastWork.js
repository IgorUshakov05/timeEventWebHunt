const FastWork = require("../Schema/FastWork");
const { v4 } = require("uuid");
const { Temporal } = require("@js-temporal/polyfill");

function getCurrentDateInMSK() {
  return Temporal.Now.plainDateISO();
}

let findFastWorkForDelete = async () => {
  console.log(getCurrentDateInMSK().toString());
  let currentDate = getCurrentDateInMSK();
  let deleteFastWork = await FastWork.deleteMany({ dateRemove: currentDate }); 
  console.log(deleteFastWork)
  return deleteFastWork ? true : false; 
};

module.exports = { findFastWorkForDelete };
