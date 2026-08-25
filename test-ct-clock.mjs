import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));

  await page.goto('http://localhost:5173/ct-clock/index.html');
  await page.waitForTimeout(2000);
  
  const content = await page.content();
  if (content.includes('Coasters Tavern')) {
      console.log('ct-clock loaded successfully');
  } else {
      console.log('ct-clock is blank or failed');
  }
  
  await browser.close();
})();
