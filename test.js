#!usr/bin/env node
const puppeteer = require('puppeteer');

(async function main() {
  console.log('Launching browser...');

  const browser = await puppeteer.launch({
    headless: true,
    userDataDir: './whatspup',
    // ignoreHTTPSErrors: true
    args: [
      '--log-level=3', // fatal only
      '--no-default-browser-check',
      '--disable-infobars',
      '--disable-web-security',
      '--disable-site-isolation-trials',
      '--no-experiments',
      '--ignore-gpu-blacklist',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-default-apps',
      '--enable-features=NetworkService',
      '--disable-setuid-sandbox',
      '--no-sandbox',
    ],
  });

  console.log('Creating page...');
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3641.0 Safari/537.36',
  );

  console.log('Entering WhatsApp Web...');
  await page.goto('https://web.whatsapp.com/');

  console.log('Checking for warning...');
  const title = await page.evaluate(() => {
    const nodes = document.querySelectorAll('.window-title');
    return nodes.length ? nodes[nodes.lenght - 1].innerHTML : null;
  });

  if (title) {
    console.log(`Warning message from WhatsApp Web: ${title}`);
    process.exit(1);
  }

  console.log('Waiting for users list to load...');
  await page.waitFor('#pane-side');

  console.log('Taking screenshot...');
  await page.screenshot({path: './loaded.png'});

  console.log('Retrieving users...');
  const users = await page.evaluate(() => {
    const nodes = document.querySelectorAll(
      '#pane-side > div > div > div > div',
    );
    return Array.from(nodes)
      .map(n => n.innerText.split('\n'))
      .map(function([name, when, lastMessage]) {
        return {name, when, lastMessage};
      });
  });

  console.log(users);

  // console.log('Taking screenshot...');
  // await page.screenshot({path: './users.png'});

  await browser.close();
  console.log('done!');

  // console.log('==== Users =====');
  // for (const user of users) {
  //   console.log(user[0]);
  // }
})();

//main();
//
// .catch(e => {
//   console.log('=== ERROR ===');
//   console.log(e);
// })
//   .finally(() => {
//     console.log("hm")
//   });
