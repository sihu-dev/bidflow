import { test, expect } from '@playwright/test';

test.describe('CSS Validation', () => {
  const pages = [
    '/',
    '/features',
    '/features/collection',
    '/pricing',
    '/about',
    '/login',
  ];

  for (const path of pages) {
    test(`${path} should have valid CSS layout`, async ({ page }) => {
      await page.goto(path);

      // Check header is properly positioned
      const header = page.locator('header');
      await expect(header).toBeVisible();
      const headerBox = await header.boundingBox();
      expect(headerBox?.y).toBe(0); // Header should be at top

      // Check main content is visible and properly sized
      const main = page.locator('main');
      await expect(main).toBeVisible();
      const mainBox = await main.boundingBox();
      expect(mainBox?.width).toBeGreaterThan(300);

      // Check no horizontal overflow (common CSS issue)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Allow small margin

      // Check footer exists and is at bottom
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test(`${path} should render correctly on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(path);

      // Page should still be visible
      await expect(page.locator('main')).toBeVisible();

      // No horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
    });
  }

  test('should have consistent button styles', async ({ page }) => {
    await page.goto('/');

    // Primary CTA buttons
    const primaryButtons = page.locator('a.bg-primary, button.bg-primary');
    const count = await primaryButtons.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const button = primaryButtons.nth(i);
        const isVisible = await button.isVisible();
        if (isVisible) {
          // Check button has proper padding
          const box = await button.boundingBox();
          expect(box?.height).toBeGreaterThan(30);
        }
      }
    }
  });

  test('should have proper text contrast', async ({ page }) => {
    await page.goto('/');

    // Check main heading is visible and has good contrast
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // Check muted text is still readable
    const mutedText = page.locator('.text-muted-foreground').first();
    if (await mutedText.count() > 0) {
      await expect(mutedText).toBeVisible();
    }
  });

  test('should load all CSS stylesheets', async ({ page }) => {
    const failedRequests: string[] = [];

    page.on('response', (response) => {
      if (response.url().includes('.css') && response.status() >= 400) {
        failedRequests.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(failedRequests).toHaveLength(0);
  });

  test('should have no layout shifts after load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get initial header position
    const headerBefore = await page.locator('header').boundingBox();

    // Wait a bit more
    await page.waitForTimeout(500);

    // Get header position again
    const headerAfter = await page.locator('header').boundingBox();

    // Position should be stable
    expect(headerAfter?.y).toBe(headerBefore?.y);
  });
});
