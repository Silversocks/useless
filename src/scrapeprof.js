// middlewares/instagramScraper.js
const puppeteer = require("puppeteer");
const fs = require("fs");
require("dotenv").config();

const COOKIES_PATH = "./cookies.json";

async function loginInstagram(page) {
  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector('input[name="username"]', { visible: true });
  await page.type('input[name="username"]', process.env.IG_USERNAME, { delay: 100 });
  await page.type('input[name="password"]', process.env.IG_PASSWORD, { delay: 100 });

  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  const cookies = await page.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
}

async function loadCookies(page) {
  if (fs.existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
    await page.setCookie(...cookies);
  }
}

module.exports = async (req, res, next) => {
  const targetUsername = req.body.username; // or set from req.osintData, etc.

  if (!targetUsername) {
    return res.status(400).json({ error: "Missing Instagram username." });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await loadCookies(page);
    await page.goto(`https://www.instagram.com/${targetUsername}/`, {
      waitUntil: "networkidle2",
    });

    // Check for login page
    if (page.url().includes("/accounts/login")) {
      console.log("🔐 Logging in...");
      await loginInstagram(page);
      await page.goto(`https://www.instagram.com/${targetUsername}/`, {
        waitUntil: "networkidle2",
      });
    }

    // Scrape basic profile data
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText : null;
      };

      return {
        bio: getText("div.-vDIg span"),
        posts: getText("header li:nth-child(1) span"),
        followers: getText("header li:nth-child(2) span"),
        following: getText("header li:nth-child(3) span"),
        fullName: getText("header section h1"),
        isPrivate: !!document.querySelector("h2:contains('This Account is Private')"),
      };
    });

    req.osintData = req.osintData || {};
    req.osintData.instagram = { username: targetUsername, ...data };

    await browser.close();
    next();
  } catch (err) {
    console.error("❌ Instagram scrape failed:", err);
    await browser.close();
    res.status(500).json({ error: "Failed to scrape Instagram profile." });
  }
};
