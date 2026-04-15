const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
      else console.log('BROWSER MSG:', msg.text());
    });
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    // Catch fetch/network errors
    page.on('requestfailed', request => {
      console.log('NETWORK ERROR:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to http://localhost:3000 ...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log("Page loaded. Closing...");
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
