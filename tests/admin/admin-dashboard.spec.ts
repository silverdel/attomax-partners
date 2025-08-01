import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('should display admin dashboard correctly', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Check if the page loads correctly
    await expect(page).toHaveTitle(/ATTOMAX Partners/);
    
    // Check for main dashboard heading
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    
    // Check for KPI cards
    await expect(page.locator('text=Total Partners')).toBeVisible();
    await expect(page.locator('text=Active Partners')).toBeVisible();
    await expect(page.locator('text=Partner Sales')).toBeVisible();
    await expect(page.locator('text=Pending Commissions')).toBeVisible();
    
    // Check for sidebar navigation
    await expect(page.locator('text=ATTOMAX Admin')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/partners"]')).toBeVisible();
    await expect(page.locator('nav a[href="/admin/orders"]')).toBeVisible();
  });

  test('should navigate between admin sections', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Test navigation to partners page
    await page.click('text=Partners');
    await expect(page).toHaveURL('/admin/partners');
    
    // Test navigation back to dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/admin/dashboard');
  });
});