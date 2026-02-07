"use strict"

const express = require("express")
const line = require("@line/bot-sdk")

const app = express()

/* ===== 基本設定（全部用環境變數）===== */
const CONFIG = {
  CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN,
  CHANNEL_SECRET: process.env.CHANNEL_SECRET,
}

const lineConfig = {
  channelAccessToken: CONFIG.CHANNEL_ACCESS_TOKEN,
  channelSecret: CONFIG.CHANNEL_SECRET,
}

const client = new line.Client(lineConfig)

/* ===== 健康檢查 ===== */
app.get("/", (req, res) => {
  res.status(200).send("OK")
})

/* ===== LINE Webhook ===== */
app.post(
  "/webhook",
  line.middleware(lineConfig),
  (req, res) => {
    // LINE 只在乎你有沒有回 200
    res.sendStatus(200)
  }
)

/* ===== 啟動（Render 必須）===== */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("LINE Bot running on port", PORT)
})

