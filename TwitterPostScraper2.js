/* Created for project TNI-AU */

// Importing library for Twitter Scraper
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const ExcelJS = require("exceljs");

// Add library moments
const moment = require("moment");

// Adding stealth plugin for puppeteer
puppeteer.use(stealthPlugin());

let browser = null;
let page = null;

// Function for scraping Twitter
const twitterPostScraper = {
  getProfile: async (query, count) => {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--proxy-server=direct://",
        "--proxy-bypass-list=*",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--headless",
      ],
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();

    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Speed improvement for scraping with latest user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.153 Mobile Safari/537.36."
    );

    console.log("Start scraping user profile");

    // Change query from "tni au" -> tni+au
    query = query.replace(/ /g, "+");

    // Setting up Twitter URL and function for scraping Twitter
    const TWITTER_URL = `https://nitter.poast.org/search?f=tweets&q=${query}&since=&until=&near=`;

    // Goto user based on query
    await page.goto(TWITTER_URL);

    await page.waitForTimeout(5000);

    // Track time for scraping
    console.time("Scraping Time For User Profile");
    let startScraping = new Date().getTime();

    let userProfile = [];
    let tweets = [];

    while (true) {
      await page.waitForTimeout(5000);

      let timeline = await page.waitForXPath("/html/body/div/div/div[2]", {
        timeout: 3000,
      });

      await page.waitForTimeout(5000);

      const totalTimeline = await timeline.evaluate(
        (el) => el.children.length,
        timeline[0]
      );

      console.log("Total timeline", totalTimeline);

      const tweet = await page.$$eval(".timeline-item", (nodes) => {
        return nodes.map((node) => {
          let post = (node.querySelector(".tweet-content")?.innerText || "")
            .replace(/\n/g, " ")
            .replace(/,/g, ";");
          let date = node.querySelector(".tweet-date a")?.title || "";
          let link = node.querySelector(".tweet-link")?.href || "";
          let avatar = node.querySelector(".avatar")?.src || "";
          let name = node.querySelector(".fullname")?.title || "";
          let username = node.querySelector(".username")?.title || "";
          let comment =
            node.querySelector("div.tweet-stats span:nth-child(1) div")
              ?.textContent || "0";
          let retweet =
            node.querySelector("div.tweet-stats span:nth-child(2) div")
              ?.textContent || "0";
          let quote =
            node.querySelector("div.tweet-stats span:nth-child(3) div")
              ?.textContent || "0";
          let likes =
            node.querySelector("div.tweet-stats span:nth-child(4) div")
              ?.textContent || "0";

          return {
            avatar,
            name,
            username,
            post,
            date,
            link,
            comment,
            retweet,
            quote,
            likes,
          };
        });
      });

      tweets.push(tweet);
      tweets = tweets.flat();

      if (tweets.length >= count || totalTimeline < 3) {
        console.log("STOPPP!!!");
        break;
      } else {
        await page.waitForXPath(`//div[${totalTimeline - 1}]/a`).catch(() => {
          return undefined;
        });
        const btn = await page.$x(`//div[${totalTimeline - 1}]/a`);

        await btn[0].click();

        await page.waitForNavigation({
          waitUntil: "networkidle2",
        });

        await page.waitForXPath("/html/body/div/div/div[2]");
        await page.waitForTimeout(10000);
      }
    }

    for (let i = 0; i < tweets.length; i++) {
      tweets[i].date = moment(
        tweets[i].date,
        "MMM D, YYYY · hh:mm A UTC"
      ).format("YYYY-MM-DD");
    }

    userProfile.push({
      tweets: tweets,
    });

    //Track time for scraping
    let endScraping = new Date().getTime();
    let timeScraping = endScraping - startScraping;
    console.timeEnd("Scraping Time For User Profile");
    console.log("Scraping Time For User Profile: " + timeScraping + "ms");

    console.log("Total post: ", userProfile[0].tweets.length);

    // Create a workbook and add a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Twitter Data");

    // Define headers
    const headers = [
      "Avatar",
      "Name",
      "Username",
      "Post",
      "Date",
      "Link",
      "Comment",
      "Retweet",
      "Quote",
      "Likes",
    ];

    // Add headers to the worksheet
    worksheet.addRow(headers);

    // Add data to the worksheet
    userProfile[0].tweets.forEach((row) => {
      worksheet.addRow([
        row.avatar,
        row.name,
        row.username,
        row.post,
        row.date,
        row.link,
        row.comment,
        row.retweet,
        row.quote,
        row.likes,
      ]);
    });

    // // Save the workbook to a folder
    // const folderPath = path.join(__dirname, "result"); // Specify the folder path here
    // const filePath = path.join(folderPath, `${query}_data.xlsx`);

    workbook.xlsx
      .writeFile(`${query}_data.xlsx`)
      .then(() => {
        console.log("Excel file created successfully!");
      })
      .catch((error) => {
        console.error("Error creating Excel file:", error);
      });
    
    return userProfile;
  },
  end: async () => {
    await browser.close();
  },
};

module.exports = twitterPostScraper;
