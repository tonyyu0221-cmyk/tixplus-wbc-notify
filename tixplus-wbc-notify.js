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
app.use(express.json())

// ===== webhook =====
app.post("/webhook", async (req, res) => {
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
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "✅ Bot 已成功回覆",
        })
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
  }
})

/* ===== 啟動（Render 必須）===== */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("LINE Bot running on port", PORT)
})

