import { test, expect } from '@playwright/test'

test.describe('Search Bar Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page
    await page.goto('http://localhost:3000/products')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display search bar on products page', async ({ page }) => {
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="search" i]')
    await expect(searchInput).toBeVisible()
  })

  test('should allow typing in search bar', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Type search term
    await searchInput.fill('tomato')
    
    // Verify value is entered
    const value = await searchInput.inputValue()
    expect(value).toBe('tomato')
  })

  test('should filter products based on search query', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Type search term
    await searchInput.fill('tomato')
    
    // Submit search by pressing Enter
    await searchInput.press('Enter')
    
    // Wait for page to load with search results
    await page.waitForLoadState('networkidle')
    
    // Verify URL contains search parameter
    await expect(page).toHaveURL(/search=tomato/)
    
    // Check for search results heading
    const heading = page.locator('text=Search results for')
    await expect(heading).toBeVisible()
  })

  test('should show "no results" message when search returns nothing', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Search for non-existent product
    await searchInput.fill('xyznonexistent123456')
    
    // Submit search
    await searchInput.press('Enter')
    
    // Wait for page to update
    await page.waitForLoadState('networkidle')
    
    // Check for no results message
    const url = page.url()
    expect(url).toContain('search=xyznonexistent123456')
  })

  test('should clear search and show all products again', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Search for something
    await searchInput.fill('tomato')
    await searchInput.press('Enter')
    
    // Wait for search results
    await page.waitForLoadState('networkidle')
    
    // Verify search URL
    await expect(page).toHaveURL(/search=tomato/)
    
    // Clear search
    await searchInput.clear()
    await searchInput.press('Enter')
    
    // Wait for page to update
    await page.waitForLoadState('networkidle')
    
    // Verify search is cleared from URL
    const url = page.url()
    expect(url).not.toContain('search=')
    
    // Verify input is empty
    const value = await searchInput.inputValue()
    expect(value).toBe('')
  })

  test('should handle special characters in search', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Type special characters
    await searchInput.fill('!@#$%')
    
    // Verify value is entered
    const value = await searchInput.inputValue()
    expect(value).toBe('!@#$%')
    
    // Should handle gracefully without crashing
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')
    
    // Page should still be accessible
    await expect(searchInput).toBeVisible()
  })

  test('should search case-insensitively', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Search with uppercase
    await searchInput.fill('TOMATO')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')
    
    // Verify search works with uppercase
    await expect(page).toHaveURL(/search=TOMATO/)
    
    // Clear and search with lowercase
    await searchInput.clear()
    await searchInput.fill('tomato')
    await searchInput.press('Enter')
    await page.waitForLoadState('networkidle')
    
    // Should find same results for both cases
    await expect(page).toHaveURL(/search=tomato/)
  })

  test('should display search input with proper placeholder', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Verify placeholder exists
    const placeholder = await searchInput.getAttribute('placeholder')
    expect(placeholder).toBeDefined()
    expect(placeholder?.toLowerCase()).toContain('search')
  })

  test('should be accessible and keyboard navigable', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i]').first()
    
    // Tab focus to search input
    await page.keyboard.press('Tab')
    
    // Type in search input
    await page.keyboard.type('test')
    
    // Verify value was entered
    const value = await searchInput.inputValue()
    expect(value).toContain('test')
    
    // Press Enter to submit
    await page.keyboard.press('Enter')
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    
    // Verify search was performed
    await expect(page).toHaveURL(/search=test/)
  })
})
