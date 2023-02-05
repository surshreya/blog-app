const puppeteer = require("puppeteer");

jest.setTimeout(30000);

let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  await page.goto("localhost:3000");
});

test("Launch a browser", async () => {
  // TEST THE HEADER
  const appText = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(appText).toEqual("Blogster");
});

afterEach(async () => {
  await browser.close();
});
