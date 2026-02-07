"use strict"

const express = require("express")
const line = require("@line/bot-sdk")

const app = express()

const CONFIG = {
  CHANNEL_ACCESS_TOKEN: process.env.CHANNEL_ACCESS_TOKEN,
  CHANNEL_SECRET: process.env.CHANNEL_SECRET,
}

const lineConfig = {
  channelAccessToken: CONFIG.CHANNEL_ACCESS_TOKEN,
  channelSecret: CONFIG.CHANNEL_SECRET,
}

const client = new line.Client(lineConfig)

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
        if (event.message.text.includes("查票")) {
          const message = await checkTicketsAndNotify()

          await client.replyMessage(event.replyToken, {
            type: "text",
            text: message,
          })
        }
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
  }
})

async function checkTicketsAndNotify() {
  return "🎟 查票功能已接通（測試中）"
}

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("LINE Bot running on port", PORT)
})
