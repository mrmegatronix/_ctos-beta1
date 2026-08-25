const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) console.log('PAGE RESPONSE ERROR:', response.status(), response.url());
  });

  console.log('Navigating...');
  await page.goto('http://localhost:3000/');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking Operations...');
  const opsBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Operations'));
  });
  if (opsBtn) await opsBtn.click();
  else console.log('Ops not found');

  await new Promise(r => setTimeout(r, 500));

  console.log('Clicking Documents...');
  const docBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Documents'));
  });
  
  if (docBtn) await docBtn.click();
  else console.log('Documents not found');

  await new Promise(r => setTimeout(r, 2000));
  console.log('Done.');
  await browser.close();
})();
