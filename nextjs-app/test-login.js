const { chromium } = require('playwright');

// Uso: TEST_EMAIL=... TEST_PASSWORD=... node test-login.js (credenciais nunca no código)
(async () => {
    if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
        console.error('Defina TEST_EMAIL e TEST_PASSWORD.');
        process.exit(1);
    }
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

    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded', timeout: 120000 });

    console.log("Filling login...");
    await page.fill('input[type="email"]', process.env.TEST_EMAIL);
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
    const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.click('button[type="submit"]');
    await navPromise;

    await page.waitForTimeout(5000);

    console.log("Navigating to estudantes...");
    await page.goto('http://localhost:3000/estudantes', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(5000);

    console.log("Navigating to diario...");
    await page.goto('http://localhost:3000/diario', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(5000);

    console.log("Navigating to gestao...");
    await page.goto('http://localhost:3000/gestao', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(5000);

    await browser.close();
    console.log("Done.");
})();
