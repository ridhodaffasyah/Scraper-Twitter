const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../index"); // Update the path to your main app file

chai.use(chaiHttp);
const expect = chai.expect;

describe("API Integration Tests For Scraper Service", () => {
  // Test the root endpoint
  describe("POST /", () => {
    it("should return 'Service scraper is running!'", (done) => {
      chai
        .request(app)
        .post("/")
        .send("Service scraper is running!")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.equal("Service scraper is running!");
          done(); // Call done() to indicate test completion
        });
    });
  });

  // Test the /linkedin-post endpoint
  describe("POST /linkedin-post", () => {
    it("should scrape LinkedIn post data as an Array", (done) => {
      const requestBody = {
        linkedInUrl: "https://www.linkedin.com/in/sandhikagalih/",
      };

      chai
        .request(app)
        .post("/linkedin-post")
        .send(requestBody)
        .timeout(100000)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done(); // Call done() to indicate test completion
        });
    }).timeout(100000);

    it("should return an error if no LinkedIn URL is provided", (done) => {
      const requestBody = {};

      chai
        .request(app)
        .post("/linkedin-post")
        .send(requestBody)
        .timeout(10000)
        .end((err, res) => {
          expect(res).to.have.status(500);
          done(); // Call done() to indicate test completion
        });
    }).timeout(10000);

    it("should return an response if there are no post found or account not detected", (done) => {
      const requestBody = {
        linkedInUrl: "https://www.linkedin.com/in/dion-timothy-kaban-86382b1a0/"
      };

      chai
        .request(app)
        .post("/linkedin-post")
        .send(requestBody)
        .timeout(100000)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            message: "No post found or Account not detected",
            post: [],
          });
          done(); // Call done() to signal that the test case is finished
        });
    }).timeout(100000);
  });

  // Test the /twitter-profile endpoint
  describe("POST /twitter-profile", () => {
    it("should scrape Twitter Profile data", (done) => {
      const requestBody = {
        userLink: "KombinasiLinear",
      };

      chai
        .request(app)
        .post("/twitter-profile")
        .send(requestBody)
        .timeout(100000)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("name");
          expect(res.body).to.have.property("description");
          expect(res.body).to.have.property("location");
          expect(res.body).to.have.property("followers");
          expect(res.body).to.have.property("following");
          expect(res.body).to.have.property("image_url");
          expect(res.body).to.have.property("tweets");
          expect(res.body.tweets).to.be.an("array");
          done(); // Call done() to indicate test completion
        });
    }).timeout(100000);

    it("should return an error if no Username Twitter is provided", (done) => {
      const requestBody = {};

      chai
        .request(app)
        .post("/twitter-profile")
        .send(requestBody)
        .timeout(10000)
        .end((err, res) => {
          expect(res).to.have.status(500);
          done(); // Call done() to indicate test completion
        });
    }).timeout(10000);

    it("should return an response if there are no posts found or Account cannot be reached", (done) => {
      const requestBody = {
        userLink: "DashboardHRM"
      };

      chai
        .request(app)
        .post("/twitter-profile")
        .send(requestBody)
        .timeout(100000)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            description: "",
            followers: "",
            following: "",
            image_url: "",
            location: "",
            name: "DashboardHRM",
            tweets: [],
          });
          done(); // Call done() to signal that the test case is finished
        });
    }).timeout(100000);
  });
});
