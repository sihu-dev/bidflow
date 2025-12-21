#!/usr/bin/env node

/**
 * BIDFLOW Font Rendering Verification Script
 *
 * Checks:
 * 1. Noto Sans KR for Korean text
 * 2. IBM Plex Mono for code blocks
 * 3. No "NOGLYPH" boxes or broken characters
 * 4. Computed font-family for each page
 *
 * Usage: node scripts/font-verification.mjs
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3010';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots', 'font-check');
const REPORT_PATH = path.join(process.cwd(), 'font-verification-report.json');

// All routes from the app directory
const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/ai-dashboard', name: 'AI Dashboard' },
  { path: '/contact', name: 'Contact' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/docs', name: 'Docs' },
  { path: '/docs/api', name: 'Docs API' },
  { path: '/docs/tutorials', name: 'Docs Tutorials' },
  { path: '/features', name: 'Features' },
  { path: '/features/ai-matching', name: 'Features AI Matching' },
  { path: '/features/alerts', name: 'Features Alerts' },
  { path: '/features/api', name: 'Features API' },
  { path: '/features/collaboration', name: 'Features Collaboration' },
  { path: '/features/collection', name: 'Features Collection' },
  { path: '/features/proposal', name: 'Features Proposal' },
  { path: '/features/security', name: 'Features Security' },
  { path: '/features/spreadsheet', name: 'Features Spreadsheet' },
  { path: '/forgot-password', name: 'Forgot Password' },
  { path: '/integrations', name: 'Integrations' },
  { path: '/integrations/kepco', name: 'Integrations KEPCO' },
  { path: '/integrations/kogas', name: 'Integrations KOGAS' },
  { path: '/integrations/narajangto', name: 'Integrations Narajangto' },
  { path: '/integrations/samgov', name: 'Integrations SAM.gov' },
  { path: '/integrations/ted', name: 'Integrations TED' },
  { path: '/integrations/un', name: 'Integrations UN' },
  { path: '/login', name: 'Login' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/privacy', name: 'Privacy' },
  { path: '/research', name: 'Research' },
  { path: '/signup', name: 'Signup' },
  { path: '/sludge', name: 'Sludge' },
  { path: '/sludge/monitoring', name: 'Sludge Monitoring' },
  { path: '/support', name: 'Support' },
  { path: '/terms', name: 'Terms' },
  { path: '/use-cases', name: 'Use Cases' },
  { path: '/use-cases/construction', name: 'Use Cases Construction' },
  { path: '/use-cases/facility', name: 'Use Cases Facility' },
  { path: '/use-cases/it-services', name: 'Use Cases IT Services' },
  { path: '/use-cases/logistics', name: 'Use Cases Logistics' },
  { path: '/use-cases/manufacturing', name: 'Use Cases Manufacturing' },
];

/**
 * Verify font rendering on a page
 */
async function verifyFontsOnPage(page, route) {
  const url = `${BASE_URL}${route.path}`;

  try {
    console.log(`\n📄 Checking: ${route.name} (${route.path})`);

    // Navigate to page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for fonts to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const screenshotPath = path.join(
      SCREENSHOT_DIR,
      `${route.path.replace(/\//g, '_') || '_home'}.png`
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    // Check font availability using document.fonts API
    const fontCheck = await page.evaluate(() => {
      const results = {
        notoSansKR: {
          loaded: false,
          weights: []
        },
        ibmPlexMono: {
          loaded: false,
          weights: []
        }
      };

      // Check if fonts are loaded
      const fonts = document.fonts;

      // Check Noto Sans KR
      const notoWeights = [400, 500, 600, 700];
      for (const weight of notoWeights) {
        const isLoaded = fonts.check(`${weight} 16px "Noto Sans KR"`);
        if (isLoaded) {
          results.notoSansKR.loaded = true;
          results.notoSansKR.weights.push(weight);
        }
      }

      // Check IBM Plex Mono
      const plexWeights = [400, 500, 600];
      for (const weight of plexWeights) {
        const isLoaded = fonts.check(`${weight} 16px "IBM Plex Mono"`);
        if (isLoaded) {
          results.ibmPlexMono.loaded = true;
          results.ibmPlexMono.weights.push(weight);
        }
      }

      return results;
    });

    // Get computed font families for different elements
    const computedFonts = await page.evaluate(() => {
      const samples = {
        body: null,
        heading: null,
        paragraph: null,
        code: null,
        pre: null,
        button: null,
        koreanText: null
      };

      // Body
      const body = document.querySelector('body');
      if (body) {
        samples.body = window.getComputedStyle(body).fontFamily;
      }

      // Heading (h1, h2, or h3)
      const heading = document.querySelector('h1, h2, h3');
      if (heading) {
        samples.heading = window.getComputedStyle(heading).fontFamily;
      }

      // Paragraph
      const paragraph = document.querySelector('p');
      if (paragraph) {
        samples.paragraph = window.getComputedStyle(paragraph).fontFamily;
      }

      // Code
      const code = document.querySelector('code');
      if (code) {
        samples.code = window.getComputedStyle(code).fontFamily;
      }

      // Pre (code block)
      const pre = document.querySelector('pre');
      if (pre) {
        samples.pre = window.getComputedStyle(pre).fontFamily;
      }

      // Button
      const button = document.querySelector('button');
      if (button) {
        samples.button = window.getComputedStyle(button).fontFamily;
      }

      // Find Korean text
      const allText = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      for (const el of allText) {
        const text = el.textContent || '';
        if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text)) {
          samples.koreanText = window.getComputedStyle(el).fontFamily;
          break;
        }
      }

      return samples;
    });

    // Check for broken characters (NOGLYPH boxes)
    const brokenChars = await page.evaluate(() => {
      const issues = [];

      // Look for replacement character (�) or empty boxes
      const allElements = document.querySelectorAll('*');
      const brokenCharPattern = /\uFFFD|□|▯/g;

      for (const el of allElements) {
        const text = el.textContent || '';
        if (brokenCharPattern.test(text)) {
          issues.push({
            element: el.tagName,
            text: text.substring(0, 100),
            className: el.className
          });
        }
      }

      return issues;
    });

    // Analyze results
    const notoOK = fontCheck.notoSansKR.loaded;
    const ibmPlexOK = fontCheck.ibmPlexMono.loaded;
    const noBrokenChars = brokenChars.length === 0;

    const status = notoOK && ibmPlexOK && noBrokenChars ? '✅' : '❌';

    console.log(`  ${status} Status:`);
    console.log(`    - Noto Sans KR: ${notoOK ? '✓' : '✗'} (weights: ${fontCheck.notoSansKR.weights.join(', ') || 'none'})`);
    console.log(`    - IBM Plex Mono: ${ibmPlexOK ? '✓' : '✗'} (weights: ${fontCheck.ibmPlexMono.weights.join(', ') || 'none'})`);
    console.log(`    - No broken chars: ${noBrokenChars ? '✓' : '✗'}`);

    if (!noBrokenChars) {
      console.log(`    - Found ${brokenChars.length} elements with broken characters`);
    }

    // Show computed fonts
    console.log(`  📝 Computed font families:`);
    for (const [key, value] of Object.entries(computedFonts)) {
      if (value) {
        console.log(`    - ${key}: ${value}`);
      }
    }

    return {
      route: route.path,
      name: route.name,
      url,
      screenshot: screenshotPath,
      fontCheck,
      computedFonts,
      brokenChars,
      success: notoOK && ibmPlexOK && noBrokenChars
    };

  } catch (error) {
    console.error(`  ❌ Error checking ${route.name}:`, error.message);
    return {
      route: route.path,
      name: route.name,
      url,
      error: error.message,
      success: false
    };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔤 BIDFLOW Font Rendering Verification');
  console.log('=' .repeat(60));
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOT_DIR}\n`);

  // Create screenshot directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Enable font loading
  await page.evaluateOnNewDocument(() => {
    document.fonts.ready.then(() => {
      console.log('Fonts ready');
    });
  });

  const results = [];
  let successCount = 0;
  let failCount = 0;

  // Check each route
  for (const route of ROUTES) {
    const result = await verifyFontsOnPage(page, route);
    results.push(result);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  await browser.close();

  // Generate summary report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${successCount}/${ROUTES.length}`);
  console.log(`❌ Failed: ${failCount}/${ROUTES.length}`);
  console.log(`📁 Screenshots: ${SCREENSHOT_DIR}`);

  // Failed pages
  if (failCount > 0) {
    console.log('\n🔴 Failed Pages:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.name} (${r.route})`);
        if (r.error) {
          console.log(`    Error: ${r.error}`);
        }
        if (r.brokenChars && r.brokenChars.length > 0) {
          console.log(`    Broken chars: ${r.brokenChars.length} instances`);
        }
        if (r.fontCheck) {
          if (!r.fontCheck.notoSansKR.loaded) {
            console.log(`    Missing: Noto Sans KR`);
          }
          if (!r.fontCheck.ibmPlexMono.loaded) {
            console.log(`    Missing: IBM Plex Mono`);
          }
        }
      });
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: ROUTES.length,
      passed: successCount,
      failed: failCount
    },
    results
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${REPORT_PATH}`);

  // Exit with error if any failed
  process.exit(failCount > 0 ? 1 : 0);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
