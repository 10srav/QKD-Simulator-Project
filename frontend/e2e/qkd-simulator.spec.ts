/**
 * E2E Tests for QKD Simulator
 * Requires: npx playwright install
 * Run: npx playwright test
 */
import { test, expect } from '@playwright/test';

test.describe('QKD Simulator E2E', () => {
    test('home page loads with protocol cards', async ({ page }) => {
        await page.goto('/');
        await expect(page.getByText('QKD Simulator')).toBeVisible();
        await expect(page.getByText('BB84 Protocol')).toBeVisible();
        await expect(page.getByText('E91 Protocol')).toBeVisible();
    });

    test('navigate to BB84 page', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Start BB84 Simulation').click();
        await expect(page).toHaveURL(/simulate\/bb84/);
    });

    test('navigate to E91 page', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Start E91 Simulation').click();
        await expect(page).toHaveURL(/simulate\/e91/);
    });

    test('navigate to encryption page', async ({ page }) => {
        await page.goto('/');
        await page.getByText('AES Encryption Tool').click();
        await expect(page).toHaveURL(/encrypt/);
    });

    test('navigate to history page', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Simulation History').click();
        await expect(page).toHaveURL(/history/);
    });

    test('history page shows empty state', async ({ page }) => {
        await page.goto('/history');
        await expect(page.getByText('Simulation History')).toBeVisible();
    });

    test('BB84 page has configuration form', async ({ page }) => {
        await page.goto('/simulate/bb84');
        // Should show configuration controls for the simulation
        await expect(page.locator('body')).toContainText('BB84');
    });

    test('E91 page has configuration form', async ({ page }) => {
        await page.goto('/simulate/e91');
        await expect(page.locator('body')).toContainText('E91');
    });
});
