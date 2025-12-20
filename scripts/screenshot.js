/**
 * Screenshot Utility for BIDFLOW UX/UI Review
 * Usage: node scripts/screenshot.js [path] [viewport]
 * Example: node scripts/screenshot.js /features mobile
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3010';
const SCREENSHOT_DIR = path.join(__dirname, '../screenshots');

const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

const defaultPages = [
  '/',
  '/features',
  '/features/collection',
  '/pricing',
  '/login',
];

async function takeScreenshot(page, urlPath, viewport = 'desktop') {
  const vp = viewports[viewport] || viewports.desktop;
  await page.setViewport(vp);

  const url = `${BASE_URL}${urlPath}`;
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Wait for any animations
  await page.waitForTimeout(500);

  const filename = `${urlPath.replace(/\//g, '_') || '_home'}_${viewport}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  console.log(`✓ ${urlPath} (${viewport}) -> ${filename}`);
  return filepath;
}

async function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || null;
  const viewport = args[1] || 'desktop';

  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  console.log('BIDFLOW Screenshot Utility');
  console.log('=' .repeat(40));
  console.log(`Viewport: ${viewport}`);
  console.log('');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    if (targetPath) {
      // Single page
      await takeScreenshot(page, targetPath, viewport);
    } else {
      // All default pages
      for (const p of defaultPages) {
        for (const vp of Object.keys(viewports)) {
          await takeScreenshot(page, p, vp);
        }
      }
    }

    console.log('');
    console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
