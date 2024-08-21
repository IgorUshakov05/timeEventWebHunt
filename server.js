require("dotenv").config();
const express = require("express");
const connectDB = require("./database/conf");
const schedule = require("node-schedule");
const removePremium = require("./database/Request/Premium");
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
app.listen(process.env.PORT, () => {
  let connect = connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
