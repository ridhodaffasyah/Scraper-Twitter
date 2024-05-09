// Importing express and some libraries
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

// Setting up express
const app = express();
app.use(bodyParser.json());
const port = 9000;

// Import module scraper LinkedIn and Twitter
const scraperTwitter = require("./TwitterPostScraper");
const scraperTwitter2 = require("./TwitterPostScraper2");

const twitterScraperService = async (userLink) => {
  try {
    const USERNAME = process.env.TWITTER_USERNAME;
    const PASSWORD = process.env.TWITTER_PASSWORD;

    await scraperTwitter.initialize();

    if (userLink) {
      await scraperTwitter.login(USERNAME, PASSWORD);

      const result = await scraperTwitter.getProfile(userLink);

      await scraperTwitter.end();

      return result;
    } else {
      throw new Error("Username is required");
    }
  } catch (error) {
    throw new Error("An error occurred in Twitter scraper service");
  }
};

const twitterScraperService2 = async (query, count) => {
  try {
    const result = await scraperTwitter2.getProfile(query, count);

    await scraperTwitter2.end();

    return result;
  } catch (error) {
    console.error("Error in twitterScraperService2:", error);
    throw new Error("An error occurred in Twitter scraper service 3");
  }
};

app.post("/", (req, res) => {
  res.send("Service scraper is running!");
});

app.post("/twitter-profile", async (req, res) => {
  try {
    const result = await twitterScraperService(req.body.userLink);
    res.send(result);
  } catch (error) {
    res.status(500).send("An error occurred");
  }
});

app.post("/twitter-profile2", async (req, res) => {
  try {
    const result = await twitterScraperService2(req.body.query, req.body.count);
    res.send(result);
  } catch (error) {
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => console.log(`Express app running on port ${port}!`));

module.exports = app;
