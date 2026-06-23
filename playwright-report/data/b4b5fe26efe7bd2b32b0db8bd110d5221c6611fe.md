# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: searchbar.spec.ts >> Search Bar Functionality >> should show "no results" message when search returns nothing
- Location: tests\searchbar.spec.ts:50:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "search=xyznonexistent123456"
Received string:    "http://localhost:3000/products"
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
          - paragraph [ref=e42]: Browse our wide selection of fresh and organic grocery products
          - generic [ref=e43]:
            - link "Chocolate Biscuits -19% In Stock Chocolate Biscuits (76) ₹65.00 ₹80.00 Add to Cart" [ref=e44] [cursor=pointer]:
              - /url: /products/chocolate-biscuits
              - generic [ref=e45]:
                - generic [ref=e46]:
                  - img "Chocolate Biscuits" [ref=e47]
                  - generic [ref=e48]: "-19%"
                  - generic [ref=e50]: In Stock
                  - button [ref=e51]:
                    - img [ref=e52]
                - generic [ref=e54]:
                  - heading "Chocolate Biscuits" [level=3] [ref=e55]
                  - generic [ref=e56]:
                    - generic [ref=e57]:
                      - img [ref=e58]
                      - img [ref=e60]
                      - img [ref=e62]
                      - img [ref=e64]
                      - img [ref=e66]
                    - generic [ref=e68]: (76)
                  - generic [ref=e69]:
                    - generic [ref=e70]: ₹65.00
                    - generic [ref=e71]: ₹80.00
                - button "Add to Cart" [ref=e73]:
                  - img [ref=e74]
                  - text: Add to Cart
            - link "Laundry Detergent 1kg -20% In Stock Laundry Detergent 1kg (95) ₹160.00 ₹200.00 Add to Cart" [ref=e78] [cursor=pointer]:
              - /url: /products/laundry-detergent-1kg
              - generic [ref=e79]:
                - generic [ref=e80]:
                  - img "Laundry Detergent 1kg" [ref=e81]
                  - generic [ref=e82]: "-20%"
                  - generic [ref=e84]: In Stock
                  - button [ref=e85]:
                    - img [ref=e86]
                - generic [ref=e88]:
                  - heading "Laundry Detergent 1kg" [level=3] [ref=e89]
                  - generic [ref=e90]:
                    - generic [ref=e91]:
                      - img [ref=e92]
                      - img [ref=e94]
                      - img [ref=e96]
                      - img [ref=e98]
                      - img [ref=e100]
                    - generic [ref=e102]: (95)
                  - generic [ref=e103]:
                    - generic [ref=e104]: ₹160.00
                    - generic [ref=e105]: ₹200.00
                - button "Add to Cart" [ref=e107]:
                  - img [ref=e108]
                  - text: Add to Cart
            - link "Toothpaste 100g -19% In Stock Toothpaste 100g (87) ₹65.00 ₹80.00 Add to Cart" [ref=e112] [cursor=pointer]:
              - /url: /products/toothpaste-100g
              - generic [ref=e113]:
                - generic [ref=e114]:
                  - img "Toothpaste 100g" [ref=e115]
                  - generic [ref=e116]: "-19%"
                  - generic [ref=e118]: In Stock
                  - button [ref=e119]:
                    - img [ref=e120]
                - generic [ref=e122]:
                  - heading "Toothpaste 100g" [level=3] [ref=e123]
                  - generic [ref=e124]:
                    - generic [ref=e125]:
                      - img [ref=e126]
                      - img [ref=e128]
                      - img [ref=e130]
                      - img [ref=e132]
                      - img [ref=e134]
                    - generic [ref=e136]: (87)
                  - generic [ref=e137]:
                    - generic [ref=e138]: ₹65.00
                    - generic [ref=e139]: ₹80.00
                - button "Add to Cart" [ref=e141]:
                  - img [ref=e142]
                  - text: Add to Cart
            - link "Organic Olive Oil 500ml -16% In Stock Organic Olive Oil 500ml (78) ₹380.00 ₹450.00 Add to Cart" [ref=e146] [cursor=pointer]:
              - /url: /products/organic-olive-oil-500ml
              - generic [ref=e147]:
                - generic [ref=e148]:
                  - img "Organic Olive Oil 500ml" [ref=e149]
                  - generic [ref=e150]: "-16%"
                  - generic [ref=e152]: In Stock
                  - button [ref=e153]:
                    - img [ref=e154]
                - generic [ref=e156]:
                  - heading "Organic Olive Oil 500ml" [level=3] [ref=e157]
                  - generic [ref=e158]:
                    - generic [ref=e159]:
                      - img [ref=e160]
                      - img [ref=e162]
                      - img [ref=e164]
                      - img [ref=e166]
                      - img [ref=e168]
                    - generic [ref=e170]: (78)
                  - generic [ref=e171]:
                    - generic [ref=e172]: ₹380.00
                    - generic [ref=e173]: ₹450.00
                - button "Add to Cart" [ref=e175]:
                  - img [ref=e176]
                  - text: Add to Cart
            - link "Shampoo 250ml -20% In Stock Shampoo 250ml (102) ₹120.00 ₹150.00 Add to Cart" [ref=e180] [cursor=pointer]:
              - /url: /products/shampoo-250ml
              - generic [ref=e181]:
                - generic [ref=e182]:
                  - img "Shampoo 250ml" [ref=e183]
                  - generic [ref=e184]: "-20%"
                  - generic [ref=e186]: In Stock
                  - button [ref=e187]:
                    - img [ref=e188]
                - generic [ref=e190]:
                  - heading "Shampoo 250ml" [level=3] [ref=e191]
                  - generic [ref=e192]:
                    - generic [ref=e193]:
                      - img [ref=e194]
                      - img [ref=e196]
                      - img [ref=e198]
                      - img [ref=e200]
                      - img [ref=e202]
                    - generic [ref=e204]: (102)
                  - generic [ref=e205]:
                    - generic [ref=e206]: ₹120.00
                    - generic [ref=e207]: ₹150.00
                - button "Add to Cart" [ref=e209]:
                  - img [ref=e210]
                  - text: Add to Cart
            - link "All-Purpose Cleaner 750ml -20% In Stock All-Purpose Cleaner 750ml (82) ₹120.00 ₹150.00 Add to Cart" [ref=e214] [cursor=pointer]:
              - /url: /products/all-purpose-cleaner-750ml
              - generic [ref=e215]:
                - generic [ref=e216]:
                  - img "All-Purpose Cleaner 750ml" [ref=e217]
                  - generic [ref=e218]: "-20%"
                  - generic [ref=e220]: In Stock
                  - button [ref=e221]:
                    - img [ref=e222]
                - generic [ref=e224]:
                  - heading "All-Purpose Cleaner 750ml" [level=3] [ref=e225]
                  - generic [ref=e226]:
                    - generic [ref=e227]:
                      - img [ref=e228]
                      - img [ref=e230]
                      - img [ref=e232]
                      - img [ref=e234]
                      - img [ref=e236]
                    - generic [ref=e238]: (82)
                  - generic [ref=e239]:
                    - generic [ref=e240]: ₹120.00
                    - generic [ref=e241]: ₹150.00
                - button "Add to Cart" [ref=e243]:
                  - img [ref=e244]
                  - text: Add to Cart
            - link "Organic Brown Rice 2kg -16% In Stock Organic Brown Rice 2kg (94) ₹210.00 ₹250.00 Add to Cart" [ref=e248] [cursor=pointer]:
              - /url: /products/organic-brown-rice-2kg
              - generic [ref=e249]:
                - generic [ref=e250]:
                  - img "Organic Brown Rice 2kg" [ref=e251]
                  - generic [ref=e252]: "-16%"
                  - generic [ref=e254]: In Stock
                  - button [ref=e255]:
                    - img [ref=e256]
                - generic [ref=e258]:
                  - heading "Organic Brown Rice 2kg" [level=3] [ref=e259]
                  - generic [ref=e260]:
                    - generic [ref=e261]:
                      - img [ref=e262]
                      - img [ref=e264]
                      - img [ref=e266]
                      - img [ref=e268]
                      - img [ref=e270]
                    - generic [ref=e272]: (94)
                  - generic [ref=e273]:
                    - generic [ref=e274]: ₹210.00
                    - generic [ref=e275]: ₹250.00
                - button "Add to Cart" [ref=e277]:
                  - img [ref=e278]
                  - text: Add to Cart
            - link "Organic Honey 500ml -17% In Stock Organic Honey 500ml (102) ₹250.00 ₹300.00 Add to Cart" [ref=e282] [cursor=pointer]:
              - /url: /products/organic-honey-500ml
              - generic [ref=e283]:
                - generic [ref=e284]:
                  - img "Organic Honey 500ml" [ref=e285]
                  - generic [ref=e286]: "-17%"
                  - generic [ref=e288]: In Stock
                  - button [ref=e289]:
                    - img [ref=e290]
                - generic [ref=e292]:
                  - heading "Organic Honey 500ml" [level=3] [ref=e293]
                  - generic [ref=e294]:
                    - generic [ref=e295]:
                      - img [ref=e296]
                      - img [ref=e298]
                      - img [ref=e300]
                      - img [ref=e302]
                      - img [ref=e304]
                    - generic [ref=e306]: (102)
                  - generic [ref=e307]:
                    - generic [ref=e308]: ₹250.00
                    - generic [ref=e309]: ₹300.00
                - button "Add to Cart" [ref=e311]:
                  - img [ref=e312]
                  - text: Add to Cart
            - link "Coffee Beans 500g -16% In Stock Coffee Beans 500g (134) ₹380.00 ₹450.00 Add to Cart" [ref=e316] [cursor=pointer]:
              - /url: /products/coffee-beans-500g
              - generic [ref=e317]:
                - generic [ref=e318]:
                  - img "Coffee Beans 500g" [ref=e319]
                  - generic [ref=e320]: "-16%"
                  - generic [ref=e322]: In Stock
                  - button [ref=e323]:
                    - img [ref=e324]
                - generic [ref=e326]:
                  - heading "Coffee Beans 500g" [level=3] [ref=e327]
                  - generic [ref=e328]:
                    - generic [ref=e329]:
                      - img [ref=e330]
                      - img [ref=e332]
                      - img [ref=e334]
                      - img [ref=e336]
                      - img [ref=e338]
                    - generic [ref=e340]: (134)
                  - generic [ref=e341]:
                    - generic [ref=e342]: ₹380.00
                    - generic [ref=e343]: ₹450.00
                - button "Add to Cart" [ref=e345]:
                  - img [ref=e346]
                  - text: Add to Cart
            - link "Frozen Vegetables Mix -18% In Stock Frozen Vegetables Mix (72) ₹99.00 ₹120.00 Add to Cart" [ref=e350] [cursor=pointer]:
              - /url: /products/frozen-vegetables-mix
              - generic [ref=e351]:
                - generic [ref=e352]:
                  - img "Frozen Vegetables Mix" [ref=e353]
                  - generic [ref=e354]: "-18%"
                  - generic [ref=e356]: In Stock
                  - button [ref=e357]:
                    - img [ref=e358]
                - generic [ref=e360]:
                  - heading "Frozen Vegetables Mix" [level=3] [ref=e361]
                  - generic [ref=e362]:
                    - generic [ref=e363]:
                      - img [ref=e364]
                      - img [ref=e366]
                      - img [ref=e368]
                      - img [ref=e370]
                      - img [ref=e372]
                    - generic [ref=e374]: (72)
                  - generic [ref=e375]:
                    - generic [ref=e376]: ₹99.00
                    - generic [ref=e377]: ₹120.00
                - button "Add to Cart" [ref=e379]:
                  - img [ref=e380]
                  - text: Add to Cart
            - link "Croissants (Pack of 4) -17% In Stock Croissants (Pack of 4) (68) ₹150.00 ₹180.00 Add to Cart" [ref=e384] [cursor=pointer]:
              - /url: /products/croissants-pack-of-4
              - generic [ref=e385]:
                - generic [ref=e386]:
                  - img "Croissants (Pack of 4)" [ref=e387]
                  - generic [ref=e388]: "-17%"
                  - generic [ref=e390]: In Stock
                  - button [ref=e391]:
                    - img [ref=e392]
                - generic [ref=e394]:
                  - heading "Croissants (Pack of 4)" [level=3] [ref=e395]
                  - generic [ref=e396]:
                    - generic [ref=e397]:
                      - img [ref=e398]
                      - img [ref=e400]
                      - img [ref=e402]
                      - img [ref=e404]
                      - img [ref=e406]
                    - generic [ref=e408]: (68)
                  - generic [ref=e409]:
                    - generic [ref=e410]: ₹150.00
                    - generic [ref=e411]: ₹180.00
                - button "Add to Cart" [ref=e413]:
                  - img [ref=e414]
                  - text: Add to Cart
            - link "Mixed Nuts 200g -20% In Stock Mixed Nuts 200g (91) ₹280.00 ₹350.00 Add to Cart" [ref=e418] [cursor=pointer]:
              - /url: /products/mixed-nuts-200g
              - generic [ref=e419]:
                - generic [ref=e420]:
                  - img "Mixed Nuts 200g" [ref=e421]
                  - generic [ref=e422]: "-20%"
                  - generic [ref=e424]: In Stock
                  - button [ref=e425]:
                    - img [ref=e426]
                - generic [ref=e428]:
                  - heading "Mixed Nuts 200g" [level=3] [ref=e429]
                  - generic [ref=e430]:
                    - generic [ref=e431]:
                      - img [ref=e432]
                      - img [ref=e434]
                      - img [ref=e436]
                      - img [ref=e438]
                      - img [ref=e440]
                    - generic [ref=e442]: (91)
                  - generic [ref=e443]:
                    - generic [ref=e444]: ₹280.00
                    - generic [ref=e445]: ₹350.00
                - button "Add to Cart" [ref=e447]:
                  - img [ref=e448]
                  - text: Add to Cart
          - generic [ref=e452]:
            - button "Previous" [disabled]
            - generic [ref=e454]: Page 1 of 4
            - button "Next" [ref=e455] [cursor=pointer]
    - contentinfo [ref=e456]:
      - generic [ref=e458]:
        - heading "Subscribe to Our Newsletter" [level=3] [ref=e459]
        - paragraph [ref=e460]: Get updates on new products and upcoming sales
        - generic [ref=e461]:
          - textbox "Enter your email" [ref=e462]
          - button "Subscribe" [ref=e463] [cursor=pointer]
      - generic [ref=e464]:
        - generic [ref=e465]:
          - generic [ref=e466]:
            - heading "About Grocery" [level=4] [ref=e467]
            - paragraph [ref=e468]: Fresh groceries delivered to your doorstep with premium quality and competitive prices.
            - paragraph [ref=e469]: © 2026 Grocery Inc. All rights reserved.
          - generic [ref=e470]:
            - heading "Quick Links" [level=4] [ref=e471]
            - list [ref=e472]:
              - listitem [ref=e473]:
                - link "Home" [ref=e474] [cursor=pointer]:
                  - /url: /
              - listitem [ref=e475]:
                - link "Products" [ref=e476] [cursor=pointer]:
                  - /url: /products
              - listitem [ref=e477]:
                - link "About Us" [ref=e478] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e479]:
                - link "Contact" [ref=e480] [cursor=pointer]:
                  - /url: /contact
          - generic [ref=e481]:
            - heading "Categories" [level=4] [ref=e482]
            - list [ref=e483]:
              - listitem [ref=e484]:
                - link "Fruits" [ref=e485] [cursor=pointer]:
                  - /url: /products?category=fruits
              - listitem [ref=e486]:
                - link "Vegetables" [ref=e487] [cursor=pointer]:
                  - /url: /products?category=vegetables
              - listitem [ref=e488]:
                - link "Dairy" [ref=e489] [cursor=pointer]:
                  - /url: /products?category=dairy
              - listitem [ref=e490]:
                - link "Bakery" [ref=e491] [cursor=pointer]:
                  - /url: /products?category=bakery
          - generic [ref=e492]:
            - heading "Contact Us" [level=4] [ref=e493]
            - list [ref=e494]:
              - listitem [ref=e495]:
                - img [ref=e496]
                - generic [ref=e498]: +91-1234567890
              - listitem [ref=e499]:
                - img [ref=e500]
                - link "support@grocery.com" [ref=e503] [cursor=pointer]:
                  - /url: mailto:support@grocery.com
              - listitem [ref=e504]:
                - img [ref=e505]
                - generic [ref=e508]: 123 Market Street, Mumbai, India
        - generic [ref=e510]:
          - generic [ref=e511]:
            - link "Privacy Policy" [ref=e512] [cursor=pointer]:
              - /url: /privacy
            - generic [ref=e513]: "|"
            - link "Terms of Service" [ref=e514] [cursor=pointer]:
              - /url: /terms
            - generic [ref=e515]: "|"
            - link "FAQ" [ref=e516] [cursor=pointer]:
              - /url: /faq
          - generic [ref=e517]:
            - link [ref=e518] [cursor=pointer]:
              - /url: https://facebook.com
              - img [ref=e519]
            - link [ref=e521] [cursor=pointer]:
              - /url: https://twitter.com
              - img [ref=e522]
            - link [ref=e524] [cursor=pointer]:
              - /url: https://instagram.com
              - img [ref=e525]
            - link [ref=e528] [cursor=pointer]:
              - /url: https://linkedin.com
              - img [ref=e529]
  - button "Open Next.js Dev Tools" [ref=e538] [cursor=pointer]:
    - img [ref=e539]
  - alert [ref=e542]
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
> 65  |     expect(url).toContain('search=xyznonexistent123456')
      |                 ^ Error: expect(received).toContain(expected) // indexOf
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
  91  |     expect(url).not.toContain('search=')
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
```