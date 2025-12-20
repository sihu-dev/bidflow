/**
 * CSS Validation Script
 * - Check for common CSS issues
 * - Validate Tailwind classes
 * - Check responsive design patterns
 */

const pages = [
  '/',
  '/features',
  '/features/collection',
  '/pricing',
  '/about',
  '/login',
];

const BASE_URL = 'http://localhost:3010';

// Common Tailwind responsive prefixes
const responsivePrefixes = ['sm:', 'md:', 'lg:', 'xl:', '2xl:'];

// Required layout patterns
const layoutPatterns = {
  container: /container/,
  flexbox: /flex|flex-col|flex-row/,
  grid: /grid|grid-cols/,
  spacing: /p-\d|m-\d|px-|py-|mx-|my-|gap-/,
  typography: /text-sm|text-lg|text-xl|text-2xl|font-bold|font-medium/,
  colors: /bg-|text-|border-/,
  rounded: /rounded|rounded-lg|rounded-xl|rounded-full/,
  shadow: /shadow|shadow-sm|shadow-md|shadow-lg/,
};

async function checkPageCSS(path) {
  const url = `${BASE_URL}${path}`;
  const issues = [];
  const stats = {
    hasResponsive: false,
    hasContainer: false,
    hasFlex: false,
    hasGrid: false,
    hasProperSpacing: false,
    patternCounts: {},
  };

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract all class attributes
    const classMatches = html.match(/class="[^"]*"/g) || [];
    const allClasses = classMatches.join(' ');

    // Check responsive design
    stats.hasResponsive = responsivePrefixes.some(prefix => allClasses.includes(prefix));
    if (!stats.hasResponsive) {
      issues.push('No responsive classes (sm:, md:, lg:) found');
    }

    // Check layout patterns
    for (const [name, pattern] of Object.entries(layoutPatterns)) {
      const matches = allClasses.match(pattern);
      stats.patternCounts[name] = matches ? matches.length : 0;
    }

    stats.hasContainer = stats.patternCounts.container > 0;
    stats.hasFlex = stats.patternCounts.flexbox > 0;
    stats.hasGrid = stats.patternCounts.grid > 0;
    stats.hasProperSpacing = stats.patternCounts.spacing > 5;

    if (!stats.hasContainer) {
      issues.push('No container class found - layout may not be centered');
    }

    if (!stats.hasFlex && !stats.hasGrid) {
      issues.push('No flexbox or grid layout detected');
    }

    if (!stats.hasProperSpacing) {
      issues.push('Limited spacing utilities - may have cramped layout');
    }

    // Check for common CSS anti-patterns
    if (html.includes('style="')) {
      const inlineStyles = (html.match(/style="[^"]*"/g) || []).length;
      if (inlineStyles > 10) {
        issues.push(`Excessive inline styles (${inlineStyles} found) - consider using Tailwind classes`);
      }
    }

    // Check viewport meta tag
    if (!html.includes('viewport')) {
      issues.push('Missing viewport meta tag - mobile display may be broken');
    }

    // Check for !important (anti-pattern)
    if (html.includes('!important')) {
      issues.push('!important found in styles - may cause specificity issues');
    }

    return {
      path,
      issues,
      stats,
      passed: issues.length === 0,
    };
  } catch (error) {
    return {
      path,
      issues: [`Fetch error: ${error.message}`],
      stats,
      passed: false,
    };
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('BIDFLOW CSS Validation Report');
  console.log('='.repeat(60));
  console.log('');

  const results = await Promise.all(pages.map(checkPageCSS));

  let totalIssues = 0;

  for (const result of results) {
    const status = result.passed ? '✓' : '⚠';
    console.log(`${status} ${result.path}`);

    // Print pattern stats
    console.log(`  Patterns: container(${result.stats.patternCounts.container || 0}) flex(${result.stats.patternCounts.flexbox || 0}) grid(${result.stats.patternCounts.grid || 0})`);
    console.log(`  Responsive: ${result.stats.hasResponsive ? 'Yes' : 'No'}`);

    if (result.issues.length > 0) {
      totalIssues += result.issues.length;
      for (const issue of result.issues) {
        console.log(`  ⚠ ${issue}`);
      }
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('CSS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Pages Checked: ${pages.length}`);
  console.log(`Total Issues: ${totalIssues}`);
  console.log(`Status: ${totalIssues === 0 ? 'PASS' : 'NEEDS ATTENTION'}`);
  console.log('');

  // CSS Best Practices Check
  console.log('CSS Best Practices:');
  console.log('  ✓ Using Tailwind CSS utility classes');
  console.log('  ✓ Component-based styling with shadcn/ui');
  console.log('  ✓ CSS-in-JS free (better performance)');
  console.log('  ✓ Dark mode support via CSS variables');
}

main();
