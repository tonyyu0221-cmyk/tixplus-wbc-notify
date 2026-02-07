"use strict"

const express = require("express")
const line = require("@line/bot-sdk")

const app = express()

/* ===== LINE 設定（Render 環境變數）===== */
const CONFIG = {
  CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN,
  CHANNEL_SECRET: process.env.CHANNEL_SECRET,
}

const lineConfig = {
  channelAccessToken: CONFIG.CHANNEL_ACCESS_TOKEN,
  channelSecret: CONFIG.CHANNEL_SECRET,
}

const client = new line.Client(lineConfig)

/* ===== middleware ===== */
app.use(express.json())

/* ===== webhook ===== */
app.post("/webhook", async (req, res) => {
  // ⭐ LINE 只看這行
  res.sendStatus(200)

  try {
    const events = req.body?.events
    if (!Array.isArray(events)) return

    for (const event of events) {
      if (
        event.type === "message" &&
        event.message?.type === "text" &&
        event.replyToken
      ) {
        if (event.message.text.includes("查票")) {
          const message = await checkTicketsAndNotify()

          await client.replyMes
