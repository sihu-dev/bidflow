/**
 * Page Validation Script
 * - HTTP status check
 * - HTML structure validation
 * - CSS class validation
 */

const pages = [
  { path: '/', name: 'Landing' },
  { path: '/features', name: 'Features' },
  { path: '/features/collection', name: 'Feature: Collection' },
  { path: '/features/ai-matching', name: 'Feature: AI Matching' },
  { path: '/features/proposal', name: 'Feature: Proposal' },
  { path: '/features/alerts', name: 'Feature: Alerts' },
  { path: '/features/spreadsheet', name: 'Feature: Spreadsheet' },
  { path: '/features/collaboration', name: 'Feature: Collaboration' },
  { path: '/features/api', name: 'Feature: API' },
  { path: '/features/security', name: 'Feature: Security' },
  { path: '/use-cases', name: 'Use Cases' },
  { path: '/use-cases/manufacturing', name: 'Use Case: Manufacturing' },
  { path: '/use-cases/construction', name: 'Use Case: Construction' },
  { path: '/use-cases/it-services', name: 'Use Case: IT Services' },
  { path: '/integrations', name: 'Integrations' },
  { path: '/integrations/narajangto', name: 'Integration: Narajangto' },
  { path: '/integrations/ted', name: 'Integration: TED' },
  { path: '/integrations/samgov', name: 'Integration: SAM.gov' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/docs', name: 'Docs' },
  { path: '/support', name: 'Support' },
  { path: '/login', name: 'Login' },
  { path: '/signup', name: 'Signup' },
];

const BASE_URL = 'http://localhost:3010';

async function checkPage(page) {
  const url = `${BASE_URL}${page.path}`;
  const errors = [];
  const warnings = [];

  try {
    const response = await fetch(url);
    const status = response.status;
    const html = await response.text();

    // 1. HTTP Status Check
    if (status !== 200) {
      errors.push(`HTTP ${status}`);
    }

    // 2. Basic HTML Structure
    if (!html.includes('<html')) {
      errors.push('Missing <html> tag');
    }
    if (!html.includes('<head')) {
      errors.push('Missing <head> tag');
    }
    if (!html.includes('<body')) {
      errors.push('Missing <body> tag');
    }

    // 3. Header/Footer Check
    if (!html.includes('<header')) {
      warnings.push('Missing <header> element');
    }
    if (!html.includes('<footer')) {
      warnings.push('Missing <footer> element');
    }
    if (!html.includes('<main')) {
      warnings.push('Missing <main> element');
    }

    // 4. SEO Check
    if (!html.includes('<title>')) {
      errors.push('Missing <title> tag');
    }
    if (!html.includes('meta name="description"')) {
      warnings.push('Missing meta description');
    }

    // 5. CSS Check
    if (!html.includes('stylesheet') && !html.includes('.css')) {
      warnings.push('No CSS stylesheet found');
    }

    // 6. Accessibility Check
    if (!html.includes('lang="')) {
      warnings.push('Missing lang attribute on <html>');
    }

    // 7. Check for common CSS classes (Tailwind)
    const tailwindClasses = ['container', 'flex', 'grid', 'text-', 'bg-', 'p-', 'm-'];
    const hasTailwind = tailwindClasses.some(cls => html.includes(`class=`) && html.includes(cls));
    if (!hasTailwind) {
      warnings.push('Tailwind CSS classes not detected');
    }

    // 8. Check for broken image references
    const imgMatches = html.match(/<img[^>]+src="[^"]*"/g) || [];
    for (const img of imgMatches) {
      if (img.includes('src=""') || img.includes("src=''")) {
        warnings.push('Empty image src found');
        break;
      }
    }

    // 9. Check for inline error messages
    if (html.includes('Error:') || html.includes('error:')) {
      if (!html.includes('error.tsx') && !html.includes('global-error')) {
        warnings.push('Possible error message in content');
      }
    }

    return {
      name: page.name,
      path: page.path,
      status,
      errors,
      warnings,
      passed: errors.length === 0,
    };
  } catch (error) {
    return {
      name: page.name,
      path: page.path,
      status: 0,
      errors: [`Fetch error: ${error.message}`],
      warnings: [],
      passed: false,
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('BIDFLOW Page Validation Report');
  console.log('='.repeat(60));
  console.log('');

  const results = await Promise.all(pages.map(checkPage));

  let passedCount = 0;
  let failedCount = 0;
  let warningCount = 0;

  // Group results
  const passed = [];
  const failed = [];
  const withWarnings = [];

  for (const result of results) {
    if (result.passed) {
      passedCount++;
      if (result.warnings.length > 0) {
        withWarnings.push(result);
        warningCount += result.warnings.length;
      } else {
        passed.push(result);
      }
    } else {
      failedCount++;
      failed.push(result);
    }
  }

  // Print Failed
  if (failed.length > 0) {
    console.log('[FAILED]');
    console.log('-'.repeat(40));
    for (const result of failed) {
      console.log(`✗ ${result.name} (${result.path})`);
      console.log(`  Status: ${result.status}`);
      for (const error of result.errors) {
        console.log(`  ERROR: ${error}`);
      }
      for (const warning of result.warnings) {
        console.log(`  WARN: ${warning}`);
      }
      console.log('');
    }
  }

  // Print Warnings
  if (withWarnings.length > 0) {
    console.log('[WARNINGS]');
    console.log('-'.repeat(40));
    for (const result of withWarnings) {
      console.log(`⚠ ${result.name} (${result.path})`);
      for (const warning of result.warnings) {
        console.log(`  WARN: ${warning}`);
      }
    }
    console.log('');
  }

  // Print Passed
  console.log('[PASSED]');
  console.log('-'.repeat(40));
  for (const result of passed) {
    console.log(`✓ ${result.name} (${result.path})`);
  }
  console.log('');

  // Summary
  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Pages: ${pages.length}`);
  console.log(`Passed: ${passedCount} (${Math.round(passedCount/pages.length*100)}%)`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Warnings: ${warningCount}`);
  console.log('');

  if (failedCount > 0) {
    process.exit(1);
  }
}

main();
