const puppeteer = require("puppeteer");

jest.setTimeout(30000);

test("Launch a browser", async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("localhost:3000");

  // TEST THE HEADER
  const appText = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(appText).toEqual("Blogster");
});
