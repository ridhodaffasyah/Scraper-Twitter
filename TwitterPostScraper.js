/* Created for finishing final project in Bachelor Informatics ITB
@Author: Ridho Daffasyah */

// Importing library for Twitter Scraper
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const { Set } = require("immutable");

// Add library moment
const moment = require("moment");

// Adding stealth plugin for puppeteer
puppeteer.use(stealthPlugin());

// Setting up Twitter URL and function for scraping Twitter
const LOGIN_URL = "https://twitter.com/login";
let browser = null;
let page = null;

// Function for scraping Twitter
const twitterPostScraper = {
  initialize: async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--proxy-server=direct://",
        "--proxy-bypass-list=*",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      ignoreHTTPSErrors: true,
    });
    page = await browser.newPage();

    // Blocking resources to speed up scraping
    const blockedResourceTypes = [
      "font",
      "texttrack",
      "object",
      "beacon",
      "csp_report",
    ];
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (blockedResourceTypes.includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Speed improvement for scraping with latest user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.153 Mobile Safari/537.36."
    );

    page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
    });

    await page.goto(LOGIN_URL, {
      waitUntil: "domcontentloaded",
    });
  },
  login: async (username, password) => {
    // // Track time for login
    // console.time("Login Time");
    // let startLogin = new Date().getTime();

    // Waiting for page to load
    await page.waitForXPath(
      '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[5]/label/div/div[2]/div/input'
    );

    // Input username
    const inputUsername = (
      await page.$x(
        '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[5]/label/div/div[2]/div/input'
      )
    )[0];
    inputUsername.type(username);

    // Wait for username to be inputted
    await page.waitForTimeout(1000);

    // Click button next
    const buttonNext = (
      await page.$x(
        '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[6]/div'
      )
    )[0];
    buttonNext.click();

    // Waiting for page to load
    await page.waitForXPath(
      '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[1]/div/div/div[3]/div/label/div/div[2]/div[1]/input'
    );

    // Input password
    const inputPassword = (
      await page.$x(
        '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[1]/div/div/div[3]/div/label/div/div[2]/div[1]/input'
      )
    )[0];
    inputPassword.type(password);

    // Wait for password to be inputted
    await page.waitForTimeout(1000);

    // Click button login
    const buttonLogin = (
      await page.$x(
        '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[2]/div/div[1]/div/div/div'
      )
    )[0];
    buttonLogin.click();

    // Waiting for page to load
    await page.waitForXPath(
      '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[2]/div/div[2]/div/div/div/div[1]/div/div/div/form/div[1]/div/div/div/label/div[2]/div/input'
    );
    await page.waitForTimeout(1000);

    // // Track time for login
    // let endLogin = new Date().getTime();
    // let timeLogin = endLogin - startLogin;
    // console.timeEnd("Login Time");
    // console.log("Login Time: " + timeLogin + "ms");
  },
  getProfile: async (user) => {
    // Goto user based on username
    await page.goto("https://twitter.com/" + user, {
      waitUntil: "domcontentloaded",
    });

    // // Track time for scraping
    // console.time("Scraping Time For User Profile");
    // let startScraping = new Date().getTime();

    await page.waitForXPath(
      "/html/body/div[1]/div/div/div[2]/main/div/div/div/div[1]/div/div[3]/div/div/div[2]/div"
    );

    let profileNameText = "";
    let profileDescriptionText = "";
    let profileLocationText = "";
    let profileFollowersText = "";
    let profileFollowingText = "";
    let profileImageText = "";

    const usernameElement = await page
      .waitForXPath('//div[@data-testid="UserName"]', {
        timeout: 1000,
      })
      .catch(() => {
        return undefined;
      });

    if (usernameElement !== undefined) {
      // Get user profile name
      let profileName = await page.$x(
        '//div[@data-testid="UserName"]/div[1]/div/div[1]/div/div/span/span[1]'
      );

      profileNameText = await page.evaluate(
        (el) => el?.innerText,
        profileName[0]
      );
    } else {
      profileNameText = undefined;
    }

    const descriptionElement = await page
      .waitForXPath('//div[@data-testid="UserDescription"]', {
        timeout: 1000,
      })
      .catch(() => {
        return undefined;
      });

    if (descriptionElement !== undefined) {
      // Get user profile description
      let profileDescription = await page.$x(
        '//div[@data-testid="UserDescription"]/span'
      );

      profileDescriptionText = await page.evaluate(
        (el) => el?.innerText,
        profileDescription[0]
      );
    } else {
      profileDescriptionText = undefined;
    }

    const locationElement = await page
      .waitForXPath('//div[@data-testid="UserProfileHeader_Items"]', {
        timeout: 1000,
      })
      .catch(() => {
        return undefined;
      });

    if (locationElement !== undefined) {
      // Get user profile location
      let profileLocation = await page.$x(
        '//div[@data-testid="UserProfileHeader_Items"]/span[1]/span/span'
      );

      profileLocationText = await page.evaluate(
        (el) => el?.innerText,
        profileLocation[0]
      );
    } else {
      profileLocationText = undefined;
    }

    const followingElement = await page
      .waitForXPath(`//a[@href="/${user}/following"]`, {
        timeout: 1000,
      })
      .catch(() => {
        return undefined;
      });

    if (followingElement !== undefined) {
      // Get user profile followers
      let profileFollowing = await page.$x(
        `//a[@href="/${user}/following"]/span[1]/span`
      );

      profileFollowingText = await page.evaluate(
        (el) => el?.innerText,
        profileFollowing[0]
      );

      if (profileFollowingText.includes("K")) {
        profileFollowingText = profileFollowingText.replace("K", "000");
        if (profileFollowingText.includes(".")) {
          profileFollowingText = profileFollowingText.replace(".", "");
        }
      } else if (profileFollowingText.includes("M")) {
        profileFollowingText = profileFollowingText.replace("M", "000000");
        if (profileFollowingText.includes(".")) {
          profileFollowingText = profileFollowingText.replace(".", "");
        }
      } else {
        profileFollowingText = profileFollowingText.replace(",", "");
      }
    } else {
      profileFollowingText = undefined;
    }

    const followersElement = await page
      .waitForXPath(`//a[@href="/${user}/verified_followers"]`, {
        timeout: 1000,
      })
      .catch(() => {
        return undefined;
      });

    if (followersElement !== undefined) {
      // Get user profile followers
      let profileFollowers = await page.$x(
        `//a[@href="/${user}/verified_followers"]/span[1]/span`
      );

      profileFollowersText = await page.evaluate(
        (el) => el?.innerText,
        profileFollowers[0]
      );

      if (profileFollowersText.includes("K")) {
        profileFollowersText = profileFollowersText.replace("K", "000");
        if (profileFollowersText.includes(".")) {
          profileFollowersText = profileFollowersText.replace(".", "");
        }
      } else if (profileFollowersText.includes("M")) {
        profileFollowersText = profileFollowersText.replace("M", "000000");
        if (profileFollowersText.includes(".")) {
          profileFollowersText = profileFollowersText.replace(".", "");
        }
      } else {
        profileFollowersText = profileFollowersText.replace(".", "");
      }
    } else {
      profileFollowersText = undefined;
    };

    const imageElement = await page
      .waitForXPath(`//div[@data-testid="UserAvatar-Container-${user}"]`, {
        timeout: 1000,
      })
      .catch(() => {
        return undefined;
      });

    if (imageElement !== undefined) {
      // Get user profile image
      let profileImage = await page.$x(
        `//div[@data-testid="UserAvatar-Container-${user}"]/div[2]/div/div[2]/div/a/div[3]/div/div[2]/div/div`
      );

      profileImageText = await page.evaluate(
        (el) => el?.style.backgroundImage.slice(4, -1).replace(/"/g, ""),
        profileImage[0]
      );
    } else {
      profileImageText = undefined;
    }

    let userProfile = [];
    let tweetPost = [];

    await page.waitForTimeout(3000);

    let tweetCount = "";

    // Waiting for page to load
    const tweetCountElement = await page
      .waitForXPath(
        '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[1]/div[1]/div/div/div/div/div/div[2]/div/div',
        { timeout: 10000 }
      )
      .catch(() => {
        return undefined;
      });

    await page.waitForTimeout(2000);

    // Get number of tweets
    if (tweetCountElement !== undefined) {
      let tweetCountText = await page.$x(
        '//*[@id="react-root"]/div/div/div[2]/main/div/div/div/div[1]/div/div[1]/div[1]/div/div/div/div/div/div[2]/div/div'
      );
      // Adjust number of tweets
      tweetCount = await page.evaluate(
        (el) => el?.innerText,
        tweetCountText[0]
      );
    } else {
      tweetCount = undefined;
    }

    if (tweetCount !== undefined) {
      if (tweetCount.includes("K")) {
        tweetCount = tweetCount.replace("K posts", "");
        if (tweetCount.includes(".")) {
          tweetCount = tweetCount.replace(".", "");
        }
        tweetCount = tweetCount * 1000;
      } else if (tweetCount.includes("M")) {
        tweetCount = tweetCount.replace("M posts", "");
        if (tweetCount.includes(".")) {
          tweetCount = tweetCount.replace(".", "");
        }
        tweetCount = tweetCount * 1000000;
      } else {
        tweetCount = tweetCount.replace(" posts", "");
        if (tweetCount.includes(",")) {
          tweetCount = tweetCount.replace(",", "");
        }
      }

      let containerPage = [];

      await page.waitForXPath(`//div[@data-testid="cellInnerDiv"]`, {
        timeout: 10000,
      });

      if (tweetCount > 0) {
        let initHeight = 0;
        while (true) {
          let total_height = await page.evaluate("document.body.scrollHeight");
          for (let i = 1; i < total_height; i += 200) {
            // Get all tweets
            let container = await page.$x(`//div[@data-testid="cellInnerDiv"]`);

            containerPage.push(container);

            initHeight += i;
            await page.evaluate(`window.scrollTo(0, ${i + initHeight});`);
            await page.waitForTimeout(5000); // sleep a bit
          }

          // Flatten array
          containerPage = containerPage.flat();

          for (let i = 0; i < containerPage.length; i++) {
            // Get tweet
            let tweet = await containerPage[i].$x(
              `//article[@data-testid="tweet"]//div[@data-testid="tweetText"]/span`
            );

            let tweetText = await page.evaluate(
              (el) => el?.innerText,
              tweet[0]
            );

            // Get date
            let date = await containerPage[i].$x(
              `//article[@data-testid="tweet"]//time`
            );

            let dateText = await page.evaluate(
              (el) => el?.getAttribute("datetime"),
              date[0]
            );

            tweetPost.push({
              post: tweetText != undefined ? tweetText : "",
              date: dateText != undefined ? dateText : "",
            });
          }

          console.log(tweetPost.length);

          //Remove duplicate in tweetpost
          //Convert the array to a Set to remove duplicates
          const uniquePosts = new Set(tweetPost.map((tweet) => tweet.post));

          //Convert the Set back to an array
          tweetPost = uniquePosts
            .map((post) => {
              //Find the corresponding date for the unique post
              const correspondingDate = tweetPost.find(
                (tweet) => tweet.post === post
              )?.date;
              return { post, date: correspondingDate };
            })
            .toArray();

          //Remove empty post
          tweetPost = tweetPost.filter((tweet) => tweet.post != "");

          //Sort by date
          tweetPost.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
          });

          //Format date
          for (let i = 0; i < tweetPost.length; i++) {
            tweetPost[i].date = moment(tweetPost[i].date).format("YYYY-MM-DD");
          }

            console.log(tweetPost.length);
            userProfile.push({
              name: profileNameText != undefined ? profileNameText : "",
              description:
                profileDescriptionText != undefined ? profileDescriptionText : "",
              location: profileLocationText != undefined ? profileLocationText : "",
              followers: profileFollowersText != undefined ? profileFollowersText : "",
              following: profileFollowingText != undefined ? profileFollowingText : "",
              image_url: profileImageText != undefined ? profileImageText : "",
              tweets: tweetPost,
            });

            // //Track time for scraping
            // let endScraping = new Date().getTime();
            // let timeScraping = endScraping - startScraping;
            // console.timeEnd("Scraping Time For User Profile");
            // console.log("Scraping Time For User Profile: " + timeScraping + "ms");

            return userProfile[0];
        }
      } else {
        userProfile.push({
          name: profileNameText != undefined ? profileNameText : "",
          description:
            profileDescriptionText != undefined ? profileDescriptionText : "",
          location: profileLocationText != undefined ? profileLocationText : "",
          followers:
            profileFollowersText != undefined ? profileFollowersText : "",
          following:
            profileFollowingText != undefined ? profileFollowingText : "",
          image_url: profileImageText != undefined ? profileImageText : "",
          tweets: [],
        });

        // //Track time for scraping
        // let endScraping = new Date().getTime();
        // let timeScraping = endScraping - startScraping;
        // console.timeEnd("Scraping Time For User Profile");
        // console.log("Scraping Time For User Profile: " + timeScraping + "ms");

        return userProfile[0];
      }
    } else {
      userProfile.push({
        name: profileNameText != undefined ? profileNameText : "",
        description:
          profileDescriptionText != undefined ? profileDescriptionText : "",
        location: profileLocationText != undefined ? profileLocationText : "",
        followers:
          profileFollowersText != undefined ? profileFollowersText : "",
        following:
          profileFollowingText != undefined ? profileFollowingText : "",
        image_url: profileImageText != undefined ? profileImageText : "",
        tweets: [],
      });

      // //Track time for scraping
      // let endScraping = new Date().getTime();
      // let timeScraping = endScraping - startScraping;
      // console.timeEnd("Scraping Time For User Profile");
      // console.log("Scraping Time For User Profile: " + timeScraping + "ms");

      return userProfile[0];
    }
  },
  end: async () => {
    await browser.close();
  },
};

module.exports = twitterPostScraper;
