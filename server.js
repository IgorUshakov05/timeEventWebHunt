require("dotenv").config();
const express = require("express");
const connectDB = require("./database/conf");
const schedule = require("node-schedule");
const removePremium = require("./database/Request/Premium");
const removeCompany = require("./database/Request/Company");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

schedule.scheduleJob("*/5 * * * * *", async () => {
  try {
    await console.log("Проверка подписок на премиум");
    let findAllPremium = await removePremium();
    console.log("Обновленные подписки:", findAllPremium);
  } catch (e) {
    console.error("Ошибка при проверке подписок:", e);
  }
});

schedule.scheduleJob("*/8 * * * * *", async () => {
  try {
    await console.log("Проверка подписки компаний");
    let removed = await removeCompany();
    console.log("Обновленные компании:", removed);
  } catch (e) {
    console.error("Ошибка при проверке компании:", e);
  }
});
app.listen(process.env.PORT, () => {
  let connect = connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
