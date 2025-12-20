import { test, expect } from '@playwright/test';

test.describe('Marketing Pages', () => {
  test.describe('Landing Page', () => {
    test('should load without console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/');
      await expect(page).toHaveTitle(/BIDFLOW/);
      await expect(page.locator('h1')).toBeVisible();

      // Check no console errors
      expect(consoleErrors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('should have proper navigation', async ({ page }) => {
      await page.goto('/');

      // Header should be visible
      await expect(page.locator('header')).toBeVisible();

      // CTA buttons should work
      await expect(page.getByRole('link', { name: /무료로 시작하기/ })).toBeVisible();
    });
  });

  test.describe('Features Pages', () => {
    const featurePages = [
      { path: '/features', title: '기능' },
      { path: '/features/collection', title: '공고 수집' },
      { path: '/features/ai-matching', title: 'AI 매칭' },
      { path: '/features/proposal', title: '제안서' },
      { path: '/features/alerts', title: '알림' },
      { path: '/features/spreadsheet', title: '스프레드시트' },
      { path: '/features/collaboration', title: '협업' },
      { path: '/features/api', title: 'API' },
      { path: '/features/security', title: '보안' },
    ];

    for (const { path, title } of featurePages) {
      test(`${path} should load without errors`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        const response = await page.goto(path);
        expect(response?.status()).toBe(200);

        // Page should have content
        await expect(page.locator('main')).toBeVisible();

        // Check no critical console errors
        const criticalErrors = consoleErrors.filter(
          e => !e.includes('favicon') && !e.includes('devtools')
        );
        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  test.describe('Use Cases Pages', () => {
    const useCasePages = [
      '/use-cases',
      '/use-cases/manufacturing',
      '/use-cases/construction',
      '/use-cases/it-services',
    ];

    for (const path of useCasePages) {
      test(`${path} should load without errors`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('main')).toBeVisible();

        const criticalErrors = consoleErrors.filter(
          e => !e.includes('favicon') && !e.includes('devtools')
        );
        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  test.describe('Integrations Pages', () => {
    const integrationPages = [
      '/integrations',
      '/integrations/narajangto',
      '/integrations/ted',
      '/integrations/samgov',
    ];

    for (const path of integrationPages) {
      test(`${path} should load without errors`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('main')).toBeVisible();

        const criticalErrors = consoleErrors.filter(
          e => !e.includes('favicon') && !e.includes('devtools')
        );
        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  test.describe('Resource Pages', () => {
    const resourcePages = [
      '/pricing',
      '/about',
      '/contact',
      '/docs',
      '/support',
    ];

    for (const path of resourcePages) {
      test(`${path} should load without errors`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });

        const response = await page.goto(path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('main')).toBeVisible();

        const criticalErrors = consoleErrors.filter(
          e => !e.includes('favicon') && !e.includes('devtools')
        );
        expect(criticalErrors).toHaveLength(0);
      });
    }
  });

  test.describe('Auth Pages', () => {
    test('/login should load without errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto('/login');
      expect(response?.status()).toBe(200);

      // Login form should be visible
      await expect(page.getByRole('button', { name: /로그인/ })).toBeVisible();

      const criticalErrors = consoleErrors.filter(
        e => !e.includes('favicon') && !e.includes('devtools')
      );
      expect(criticalErrors).toHaveLength(0);
    });

    test('/signup should load without errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      const response = await page.goto('/signup');
      expect(response?.status()).toBe(200);

      // Signup form should be visible
      await expect(page.getByRole('button', { name: /가입/ })).toBeVisible();

      const criticalErrors = consoleErrors.filter(
        e => !e.includes('favicon') && !e.includes('devtools')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  });
});
