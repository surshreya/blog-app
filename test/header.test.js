const puppeteer = require("puppeteer");
const sessionFactory = require("./factories/sessionFactory");

jest.setTimeout(30000);

let browser, page;

beforeEach(async () => {
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  await page.goto("localhost:3000");
});

test("Check the Header App Logo", async () => {
  // TEST THE HEADER
  const appText = await page.$eval("a.brand-logo", (el) => el.innerHTML);
  expect(appText).toEqual("Blogster");
});

test("OAuth Flow", async () => {
  await page.click("ul.right a");
  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows logout button", async () => {
  const id = "63308969fa34c65839fc0f05";
  const { session, sig } = sessionFactory(id);

  await page.setCookie({ name: "session", value: session });
  await page.setCookie({ name: "session.sig", value: sig });
  await page.goto("localhost:3000");
  await page.waitFor('a[href="/auth/logout"]');

  const btnText = await page.$eval(
    'a[href="/auth/logout"]',
    (el) => el.innerHTML
  );
  expect(btnText).toEqual("Logout");
});

afterEach(async () => {
  await browser.close();
});
