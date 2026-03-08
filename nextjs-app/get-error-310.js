const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
            console.log(`[Browser ${msg.type().toUpperCase()}] ${msg.text()}`);
        }
    });
    
    page.on('pageerror', err => {
        console.log(`[Browser PAGE ERROR] ${err.message}`);
        console.log(err.stack);
    });

    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for a bit to see if error pops up
    await page.waitForTimeout(5000);
    
    await browser.close();
})();
