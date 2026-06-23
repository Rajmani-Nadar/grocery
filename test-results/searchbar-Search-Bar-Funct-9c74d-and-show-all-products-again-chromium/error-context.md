# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: searchbar.spec.ts >> Search Bar Functionality >> should clear search and show all products again
- Location: tests\searchbar.spec.ts:68:7

# Error details

```
Error: expect(received).not.toContain(expected) // indexOf

Expected substring: not "search="
Received string:        "http://localhost:3000/products?search=tomato"
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e5]:
        - link "🛒 Grocery" [ref=e6] [cursor=pointer]:
          - /url: /
        - generic [ref=e8]:
          - textbox "Search products..." [active] [ref=e9]
          - button [ref=e10] [cursor=pointer]:
            - img [ref=e11]
        - generic [ref=e14]:
          - button [ref=e16] [cursor=pointer]:
            - img [ref=e17]
          - link "0" [ref=e20] [cursor=pointer]:
            - /url: /auth/login
            - button "0" [ref=e21]:
              - img [ref=e22]
              - generic [ref=e24]: "0"
          - link "0" [ref=e26] [cursor=pointer]:
            - /url: /auth/login
            - button "0" [ref=e27]:
              - img [ref=e28]
              - generic [ref=e32]: "0"
          - link "Login" [ref=e33] [cursor=pointer]:
            - /url: /auth/login
            - button "Login" [ref=e34]:
              - img [ref=e35]
              - text: Login
    - main [ref=e38]:
      - main [ref=e39]:
        - generic [ref=e40]:
          - heading "Products" [level=1] [ref=e41]
          - paragraph [ref=e42]: Search results for "tomato"
          - link "Fresh Tomatoes -25% In Stock Fresh Tomatoes (102) ₹45.00 ₹60.00 Add to Cart" [ref=e44] [cursor=pointer]:
            - /url: /products/fresh-tomatoes
            - generic [ref=e45]:
              - generic [ref=e46]:
                - img "Fresh Tomatoes" [ref=e47]
                - generic [ref=e48]: "-25%"
                - generic [ref=e50]: In Stock
                - button [ref=e51]:
                  - img [ref=e52]
              - generic [ref=e54]:
                - heading "Fresh Tomatoes" [level=3] [ref=e55]
                - generic [ref=e56]:
                  - generic [ref=e57]:
                    - img [ref=e58]
                    - img [ref=e60]
                    - img [ref=e62]
                    - img [ref=e64]
                    - img [ref=e66]
                  - generic [ref=e68]: (102)
                - generic [ref=e69]:
                  - generic [ref=e70]: ₹45.00
                  - generic [ref=e71]: ₹60.00
              - button "Add to Cart" [ref=e73]:
                - img [ref=e74]
                - text: Add to Cart
    - contentinfo [ref=e78]:
      - generic [ref=e80]:
        - heading "Subscribe to Our Newsletter" [level=3] [ref=e81]
        - paragraph [ref=e82]: Get updates on new products and upcoming sales
        - generic [ref=e83]:
          - textbox "Enter your email" [ref=e84]
          - button "Subscribe" [ref=e85] [cursor=pointer]
      - generic [ref=e86]:
        - generic [ref=e87]:
          - generic [ref=e88]:
            - heading "About Grocery" [level=4] [ref=e89]
            - paragraph [ref=e90]: Fresh groceries delivered to your doorstep with premium quality and competitive prices.
            - paragraph [ref=e91]: © 2026 Grocery Inc. All rights reserved.
          - generic [ref=e92]:
            - heading "Quick Links" [level=4] [ref=e93]
            - list [ref=e94]:
              - listitem [ref=e95]:
                - link "Home" [ref=e96] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e97]:
                - link "Products" [ref=e98] [cursor=pointer]:
                  - /url: /products
              - listitem [ref=e99]:
                - link "About Us" [ref=e100] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e101]:
                - link "Contact" [ref=e102] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e103]:
            - heading "Categories" [level=4] [ref=e104]
            - list [ref=e105]:
              - listitem [ref=e106]:
                - link "Fruits" [ref=e107] [cursor=pointer]:
                  - /url: /products?category=fruits
              - listitem [ref=e108]:
                - link "Vegetables" [ref=e109] [cursor=pointer]:
                  - /url: /products?category=vegetables
              - listitem [ref=e110]:
                - link "Dairy" [ref=e111] [cursor=pointer]:
                  - /url: /products?category=dairy
              - listitem [ref=e112]:
                - link "Bakery" [ref=e113] [cursor=pointer]:
                  - /url: /products?category=bakery
          - generic [ref=e114]:
            - heading "Contact Us" [level=4] [ref=e115]
            - list [ref=e116]:
              - listitem [ref=e117]:
                - img [ref=e118]
                - generic [ref=e120]: +91-1234567890
              - listitem [ref=e121]:
                - img [ref=e122]
                - link "support@grocery.com" [ref=e125] [cursor=pointer]:
                  - /url: mailto:support@grocery.com
              - listitem [ref=e126]:
                - img [ref=e127]
                - generic [ref=e130]: 123 Market Street, Mumbai, India
        - generic [ref=e132]:
          - generic [ref=e133]:
            - link "Privacy Policy" [ref=e134] [cursor=pointer]:
              - /url: /privacy
            - generic [ref=e135]: "|"
            - link "Terms of Service" [ref=e136] [cursor=pointer]:
              - /url: /terms
            - generic [ref=e137]: "|"
            - link "FAQ" [ref=e138] [cursor=pointer]:
              - /url: /faq
          - generic [ref=e139]:
            - link [ref=e140] [cursor=pointer]:
              - /url: https://facebook.com
              - img [ref=e141]
            - link [ref=e143] [cursor=pointer]:
              - /url: https://twitter.com
              - img [ref=e144]
            - link [ref=e146] [cursor=pointer]:
              - /url: https://instagram.com
              - img [ref=e147]
            - link [ref=e150] [cursor=pointer]:
              - /url: https://linkedin.com
              - img [ref=e151]
  - button "Open Next.js Dev Tools" [ref=e160] [cursor=pointer]:
    - img [ref=e161]
  - alert [ref=e164]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('Search Bar Functionality', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Navigate to products page
  6   |     await page.goto('http://localhost:3000/products')
  7   |     // Wait for page to load
  8   |     await page.waitForLoadState('networkidle')
  9   |   })
  10  | 
  11  |   test('should display search bar on products page', async ({ page }) => {
  12  |     // Check if search input exists
  13  |     const searchInput = page.locator('input[placeholder*="search" i]')
  14  |     await expect(searchInput).toBeVisible()
  15  |   })
  16  | 
  17  |   test('should allow typing in search bar', async ({ page }) => {
  18  |     // Find search input
  19  |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  20  |     
  21  |     // Type search term
  22  |     await searchInput.fill('tomato')
  23  |     
  24  |     // Verify value is entered
  25  |     const value = await searchInput.inputValue()
  26  |     expect(value).toBe('tomato')
  27  |   })
  28  | 
  29  |   test('should filter products based on search query', async ({ page }) => {
  30  |     // Find search input
  31  |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  32  |     
  33  |     // Type search term
  34  |     await searchInput.fill('tomato')
  35  |     
  36  |     // Submit search by pressing Enter
  37  |     await searchInput.press('Enter')
  38  |     
  39  |     // Wait for page to load with search results
  40  |     await page.waitForLoadState('networkidle')
  41  |     
  42  |     // Verify URL contains search parameter
  43  |     await expect(page).toHaveURL(/search=tomato/)
  44  |     
  45  |     // Check for search results heading
  46  |     const heading = page.locator('text=Search results for')
  47  |     await expect(heading).toBeVisible()
  48  |   })
  49  | 
  50  |   test('should show "no results" message when search returns nothing', async ({ page }) => {
  51  |     // Find search input
  52  |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  53  |     
  54  |     // Search for non-existent product
  55  |     await searchInput.fill('xyznonexistent123456')
  56  |     
  57  |     // Submit search
  58  |     await searchInput.press('Enter')
  59  |     
  60  |     // Wait for page to update
  61  |     await page.waitForLoadState('networkidle')
  62  |     
  63  |     // Check for no results message
  64  |     const url = page.url()
  65  |     expect(url).toContain('search=xyznonexistent123456')
  66  |   })
  67  | 
  68  |   test('should clear search and show all products again', async ({ page }) => {
  69  |     // Find search input
  70  |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  71  |     
  72  |     // Search for something
  73  |     await searchInput.fill('tomato')
  74  |     await searchInput.press('Enter')
  75  |     
  76  |     // Wait for search results
  77  |     await page.waitForLoadState('networkidle')
  78  |     
  79  |     // Verify search URL
  80  |     await expect(page).toHaveURL(/search=tomato/)
  81  |     
  82  |     // Clear search
  83  |     await searchInput.clear()
  84  |     await searchInput.press('Enter')
  85  |     
  86  |     // Wait for page to update
  87  |     await page.waitForLoadState('networkidle')
  88  |     
  89  |     // Verify search is cleared from URL
  90  |     const url = page.url()
> 91  |     expect(url).not.toContain('search=')
      |                     ^ Error: expect(received).not.toContain(expected) // indexOf
  92  |     
  93  |     // Verify input is empty
  94  |     const value = await searchInput.inputValue()
  95  |     expect(value).toBe('')
  96  |   })
  97  | 
  98  |   test('should handle special characters in search', async ({ page }) => {
  99  |     // Find search input
  100 |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  101 |     
  102 |     // Type special characters
  103 |     await searchInput.fill('!@#$%')
  104 |     
  105 |     // Verify value is entered
  106 |     const value = await searchInput.inputValue()
  107 |     expect(value).toBe('!@#$%')
  108 |     
  109 |     // Should handle gracefully without crashing
  110 |     await searchInput.press('Enter')
  111 |     await page.waitForLoadState('networkidle')
  112 |     
  113 |     // Page should still be accessible
  114 |     await expect(searchInput).toBeVisible()
  115 |   })
  116 | 
  117 |   test('should search case-insensitively', async ({ page }) => {
  118 |     // Find search input
  119 |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  120 |     
  121 |     // Search with uppercase
  122 |     await searchInput.fill('TOMATO')
  123 |     await searchInput.press('Enter')
  124 |     await page.waitForLoadState('networkidle')
  125 |     
  126 |     // Verify search works with uppercase
  127 |     await expect(page).toHaveURL(/search=TOMATO/)
  128 |     
  129 |     // Clear and search with lowercase
  130 |     await searchInput.clear()
  131 |     await searchInput.fill('tomato')
  132 |     await searchInput.press('Enter')
  133 |     await page.waitForLoadState('networkidle')
  134 |     
  135 |     // Should find same results for both cases
  136 |     await expect(page).toHaveURL(/search=tomato/)
  137 |   })
  138 | 
  139 |   test('should display search input with proper placeholder', async ({ page }) => {
  140 |     // Find search input
  141 |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  142 |     
  143 |     // Verify placeholder exists
  144 |     const placeholder = await searchInput.getAttribute('placeholder')
  145 |     expect(placeholder).toBeDefined()
  146 |     expect(placeholder?.toLowerCase()).toContain('search')
  147 |   })
  148 | 
  149 |   test('should be accessible and keyboard navigable', async ({ page }) => {
  150 |     // Find search input
  151 |     const searchInput = page.locator('input[placeholder*="search" i]').first()
  152 |     
  153 |     // Tab focus to search input
  154 |     await page.keyboard.press('Tab')
  155 |     
  156 |     // Type in search input
  157 |     await page.keyboard.type('test')
  158 |     
  159 |     // Verify value was entered
  160 |     const value = await searchInput.inputValue()
  161 |     expect(value).toContain('test')
  162 |     
  163 |     // Press Enter to submit
  164 |     await page.keyboard.press('Enter')
  165 |     
  166 |     // Wait for navigation
  167 |     await page.waitForLoadState('networkidle')
  168 |     
  169 |     // Verify search was performed
  170 |     await expect(page).toHaveURL(/search=test/)
  171 |   })
  172 | })
  173 | 
```