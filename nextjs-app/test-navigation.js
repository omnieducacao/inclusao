const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });
    
    page.on('pageerror', err => {
        console.log(`[Browser PAGE ERROR] ${err.message}`);
        console.log(err.stack);
    });

    console.log("Navigating to http://localhost:3000/estudantes...");
    await page.goto('http://localhost:3000/estudantes', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForTimeout(10000); // give it time to hydrate and potentially crash
    
    console.log("Navigating to http://localhost:3000/gestao...");
    await page.goto('http://localhost:3000/gestao', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    await page.waitForTimeout(10000);
    
    await browser.close();
    console.log("Test finished.");
})();
