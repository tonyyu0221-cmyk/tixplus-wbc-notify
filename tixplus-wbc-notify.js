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
app.post("/webhook",
  async (req, res) => {
    // ⭐ 不管發生什麼事，先回 200（LINE Verify 只看這個）
    res.sendStatus(200)

    try {
      const events = req.body?.events
      if (!Array.isArray(events)) return

      for (const event of events) {
        // 只處理文字訊息
        if (
          event.type === "message" &&
          event.message?.type === "text"
        ) {
          if (event.message.text.includes("查票")) {
            const message = await checkTicketsAndNotify(false)

            if (event.replyToken) {
              await client.replyMessage(event.replyToken, {
                type: "text",
                text: message,
              })
            }
          }
        }
      }
    } catch (err) {
      // ❗ 只 log，不丟錯誤，避免 500
      console.error("Webhook handler error:", err)
    }
  }
)

/* ===== 啟動（Render 必須）===== */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("LINE Bot running on port", PORT)
})

