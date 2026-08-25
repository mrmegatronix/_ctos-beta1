import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);

  console.log('Clicking Operations...');
  const ops = await page.evaluateHandle(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Operations')));
  if (ops) await ops.click();
  await page.waitForTimeout(500);

  console.log('Clicking Documents...');
  const docs = await page.evaluateHandle(() => Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Documents')));
  if (docs) await docs.click();
  
  await page.waitForTimeout(2000);
  console.log('Done.');
  await browser.close();
})();
