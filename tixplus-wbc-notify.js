"use strict"

const axios = require("axios")
const cheerio = require("cheerio")
const cron = require("node-cron")
const express = require("express")
const line = require("@line/bot-sdk")

const CONFIG = {
  CHANNEL_ACCESS_TOKEN: "zqJ2V1YFmuT5vfe7pqYFSTLdJqYAVPDTu5XSr9jYE8H8NOOG6jt+EM81vBci+wd/I955tKAcNLfsH+OLvmgzvNcwB6GypxC+0kfktzOonzPN6rU3jfqqzn0DqW9PLyBDYs+tO0wGFtM4RNBOCCQEcwdB04t89/1O/w1cDnyilFU=",
  CHANNEL_SECRET: "1bd3bb44bd185ce2acee36a03c995efc",
  USER_ID: "anamnesisnight",
  TARGET_URL: "https://tradead.tixplus.jp/wbc2026",
  CHECK_INTERVAL: "*/15 * * * *",
  NUMBER_OF_REMINDERS: 1,
}

const lineConfig = {
  channelAccessToken: CONFIG.CHANNEL_ACCESS_TOKEN,
  channelSecret: CONFIG.CHANNEL_SECRET,
}

const client = new line.Client(lineConfig)
const app = express()

// 🔥 記住上一次刊登數（存在記憶體）
let lastListingsCount = 0

app.post("/webhook", line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events
    for (const event of events) {
      if (event.type === "message" && event.message.type === "text") {
        if (event.message.text.includes("查票")) {
          const message = await checkTicketsAndNotify(false)
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: message,
          })
        }
      }
    }
    res.sendStatus(200)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

async function checkTicketsAndNotify(push = true) {
  try {
    const response = await axios.get(CONFIG.TARGET_URL, {
      headers: { "User-Agent": "Mozilla/5.0" },
    })

    const $ = cheerio.load(response.data)
    const encodedData = $("[data-page]").attr("data-page")
    if (!encodedData) return "❌ 抓不到資料（網站可能改版或擋爬蟲）"

    const data = JSON.parse(decodeURIComponent(encodedData))
    const ticketInfoList = extractTicketInfo(data)

    const currentTotal = ticketInfoList.reduce(
      (sum, t) => sum + (Number(t.listings_count) || 0),
      0
    )

    // 👉 沒有新刊登，不推播
    if (push && currentTotal <= lastListingsCount) {
      console.log("沒有新刊登，略過通知")
      return "😴 沒有新刊登"
    }

    lastListingsCount = currentTotal

    if (ticketInfoList.length === 0) return "😢 目前沒有刊登票券"

    const messageText = formatLineMessage(ticketInfoList)

    if (push) {
      await client.pushMessage(CONFIG.USER_ID, { type: "text", text: messageText })
    }

    return messageText
  } catch (err) {
    console.error(err)
    return "❌ 查票失敗：" + err.message
  }
}

function extractTicketInfo(jsonData) {
  const results = []
  const items = jsonData?.props?.concerts || []

  items.forEach((item) => {
    if (item.listings_count >= CONFIG.NUMBER_OF_REMINDERS) {
      results.push({
        name: item.name || "未知賽事",
        date: item.concert_date || "未知日期",
        listings_count: Number(item.listings_count) || 0,
      })
    }
  })

  return results
}

function formatLineMessage(ticketList) {
  let content = `⚾ WBC 2026 票務快訊（有新刊登）⚾\n\n`
  ticketList.forEach((t) => {
    content += `🏟 ${t.name}\n📅 ${t.date}\n🎟 刊登數：${t.listings_count}\n------------------\n`
  })
  content += `\n🔗 ${CONFIG.TARGET_URL}`
  return content
}

cron.schedule(CONFIG.CHECK_INTERVAL, () => {
  checkTicketsAndNotify(true)
})

app.listen(3000, () => {
  console.log("LINE Bot server running on 3000")
})

