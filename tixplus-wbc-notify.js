"use strict"

const axios = require("axios")
const cheerio = require("cheerio")
const cron = require("node-cron")
const express = require("express")
const line = require("@line/bot-sdk")

/* ======================
   Express
====================== */
const app = express()

/* ======================
   設定（全部用環境變數）
====================== */
const CONFIG = {
  CHANNEL_ACCESS_TOKEN: zqJ2V1YFmuT5vfe7pqYFSTLdJqYAVPDTu5XSr9jYE8H8NOOG6jt+EM81vBci+wd/I955tKAcNLfsH+OLvmgzvNcwB6GypxC+0kfktzOonzPN6rU3jfqqzn0DqW9PLyBDYs+tO0wGFtM4RNBOCCQEcwdB04t89/1O/w1cDnyilFU=,
  CHANNEL_SECRET: 1bd3bb44bd185ce2acee36a03c995efc,
  USER_ID: Uanamnesisnight, // 一定要是 U 開頭
  TARGET_URL: "https://tradead.tixplus.jp/wbc2026",
  CHECK_INTERVAL: "*/15 * * * *",
  NUMBER_OF_REMINDERS: 1,
}

const lineConfig = {
  channelAccessToken: CONFIG.CHANNEL_ACCESS_TOKEN,
  channelSecret: CONFIG.CHANNEL_SECRET,
}

const client = new line.Client(lineConfig)

/* ======================
   狀態記憶（只通知新刊登）
====================== */
let lastListingsCount = 0

/* ======================
   健康檢查（重要）
====================== */
app.get("/", (req, res) => {
  res.status(200).send("OK")
})

/* ======================
   LINE Webhook（重點）
====================== */
app.post(
  "/webhook",
  line.middleware(lineConfig),
  async (req, res) => {
    // ⭐ 不

