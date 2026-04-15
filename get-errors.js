const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text());
    });
    page.on('pageerror', err => errors.push('PAGE MSG: ' + err.message));
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    fs.writeFileSync('errors.json', JSON.stringify(errors, null, 2));
    await browser.close();
  } catch(e) {
    fs.writeFileSync('errors.json', JSON.stringify([e.toString()]));
  }
})();
