# Stripe Integration Plan

## Current Checkout Flow
The current checkout flow is a simple, client-driven order creation process:

1. The customer adds products to the cart through the Zustand-based cart store.
2. The customer opens the cart page and clicks “Proceed to Checkout”.
3. The checkout page loads the user’s saved addresses from the profile API.
4. The customer selects a shipping address and a payment method.
5. The checkout page performs local validation for UPI or card-style fields.
6. When the customer clicks “Place Order”, the browser sends a POST request to /api/orders with:    
   - shippingAddressId
   - paymentMethod
   - cart items with productId, quantity, and price
7. The server route /api/orders authenticates the user, validates the address, checks stock, calculates totals, creates an order, decrements stock, and clears the cart.
8. The order is created immediately with paymentStatus = PENDING and orderStatus = CONFIRMED.
9. The user is redirected to the order success page.

This means the current flow does not involve a real payments provider and treats the order as completed before payment is verified.

## Current Order Flow
The current order flow is synchronous and optimistic:

1. The customer submits checkout data.
2. The server creates an order record in the database.
3. The server creates associated OrderItem rows.
4. The server decrements product stock.
5. The server clears the user cart.
6. The frontend redirects to the order success page.

The database currently stores order-level payment and fulfillment state through the Order model, but it does not yet support a proper payment lifecycle with provider-managed state, payment attempts, or webhook reconciliation.

## Database Analysis
The following models will be affected by a provider-independent payment integration:

### 1. Order
The Order model is the central model for payment and fulfillment state. It will need generic payment-related fields to support a provider-agnostic lifecycle.

Likely affected fields or concepts:
- paymentStatus
- orderStatus
- paymentMethod
- subtotal
- shippingCharge
- tax
- total
- shippingAddressId
- billingAddressId

### 2. OrderItem
This model holds line-item data and is already aligned with the order lifecycle. It should remain largely unchanged, but it may need to reflect the final paid state if payment fails or if order totals change during payment reconciliation.

### 3. Address
The order checkout flow already uses Address for shipping and billing context. This model does not need major changes, but it remains important for checkout and fulfillment.

### 4. Product
Product stock is decremented at order creation today. With a real payment flow, stock reservation or inventory locking should be handled more carefully so inventory is not reduced before payment is verified.

### 5. Cart and CartItem
These models are used for checkout input and current cart persistence. They are part of the checkout flow but do not need direct payment fields.

### 6. User
The User model is already the anchor for authenticated sessions and order ownership. It should remain unchanged unless payment history or audit history becomes a requirement.

### 7. Coupon
Coupons are already part of the schema and may later be used in the checkout/payment amount calculation, but they are not required for the first payment integration.

## Architecture Proposal
The payment architecture should be provider-independent so the application can support Stripe or another provider later without a large redesign.

### Approach Comparison

| Approach | Summary | Strengths | Main Risks / Tradeoffs |
| --- | --- | --- | --- |
| Approach A | Create the Order before payment and update it after the Stripe webhook | Simpler to explain at first and easier to prototype quickly | Orders can exist before payment is confirmed, inventory may be affected too early, failed payments can leave behind confusing order states, and the flow is less aligned with Stripe best practices |
| Approach B | Create the Stripe Checkout Session first and only create the Order after the webhook confirms payment | Aligns with Stripe best practices, avoids premature order creation, keeps the cart and stock flow accurate, and is easier to extend to future providers | Slightly more complex because it requires a pending payment state and webhook-based finalization |

### Recommendation
Approach B is the better architecture.

It is the cleaner, more scalable, and more production-safe option because it treats Stripe as the source of truth for payment state. The application should not create a final order until payment has been successfully confirmed by the provider. This avoids orphaned orders, prevents stock from being reduced for failed payments, and keeps the checkout flow consistent with the normal Stripe lifecycle.

### Why Approach B follows Stripe best practices
- Stripe Checkout Sessions are the intended entry point for hosted checkout.
- Payment state should be authoritative from the provider and its webhook events.
- The application should not assume payment success before confirmation.
- The order lifecycle becomes more reliable because the order only exists after payment success.
- This pattern is easier to adapt to future gateways and reduces provider-specific coupling.

### Redesigned Payment Lifecycle
1. The customer reaches checkout and submits the cart, address, and totals.
2. The server validates the request and prepares a pending payment session state.
3. The server creates a Stripe Checkout Session for the selected checkout payload.
4. The customer is redirected to the Stripe-hosted payment UI.
5. Stripe handles the payment attempt and redirects back or sends webhook events.
6. The backend receives the webhook and evaluates the payment outcome.
7. Only if the payment is successful does the server create the final Order and OrderItems.
8. The server updates payment status, stock, cart state, and fulfillment state.
9. If payment fails or is canceled, no final order is created and the cart remains available for retry.

### Redesigned Checkout Flow
The current checkout flow should be changed from “create order immediately” to “create payment session first”.

Recommended flow:
1. The checkout page collects address and cart summary.
2. The browser submits the checkout payload to a new server endpoint.
3. The server validates the user, address, and cart contents.
4. The server creates a pending payment session and returns a Stripe Checkout Session URL or ID.
5. The browser redirects the customer to Stripe.
6. Stripe completes or cancels the payment.
7. The webhook finalizes the order only after success.

This replaces the current direct POST to /api/orders as the primary checkout step.

### Redesigned Stock Management Flow
The current stock flow should be changed because stock is reduced too early.

Recommended approach:
- Do not decrement stock when the checkout session is created.
- Do not decrement stock during the initial checkout request.
- Treat stock as pending or reserved only if the business wants a temporary hold.
- Only reduce stock after Stripe confirms payment through the webhook.
- If payment fails, stock remains unchanged.

This prevents overselling and avoids inventory mismatches caused by abandoned or failed payments.

### Redesigned Cart Clearing Flow
The current cart clearing logic should also be changed.

Recommended approach:
- Keep the cart intact until the payment is successfully confirmed.
- Do not clear the cart when the payment session is created.
- Clear the cart only after the final order is successfully created and persisted.
- If the customer cancels or fails payment, the cart should remain available so they can retry without losing items.

This makes the buying experience feel more reliable and avoids customer frustration.

### Payment Model Recommendation
The cleanest architecture is to keep the Order model focused on business fulfillment and introduce a dedicated Payment model for payment orchestration.

Why this is cleaner:
- Payment state is more complex than order state and includes retries, provider events, and webhooks.
- Orders and payments have different lifecycle concerns.
- A dedicated model makes it easier to support multiple providers later.
- This allows the Order model to remain focused on fulfillment, while the Payment model tracks the payment lifecycle.

Recommended structure for a dedicated Payment model:
- id
- orderId (nullable until the order exists)
- provider
- providerSessionId
- providerReference
- status
- amount
- currency
- attemptCount
- lastEvent
- metadata
- errorMessage
- createdAt
- updatedAt

### Generic payment fields
If a dedicated Payment model is introduced, the system should use generic payment fields rather than provider-specific ones. Recommended fields include:

- paymentProvider
- paymentSessionId
- paymentReference
- paymentStatus
- paymentAmount
- currency
- paymentLastEvent
- paymentAttemptCount
- paymentErrorMessage
- paymentMetadata

This keeps the design provider-agnostic while still supporting Stripe and future gateways.

## Stripe Integration Plan

### Phase 1: Stripe Configuration
- Add Stripe environment variables for secret key, publishable key, webhook secret, and app URL.
- Configure the webhook endpoint in the Stripe dashboard.
- Ensure the app uses secure server-side configuration for all payment operations.
- Validate that the app can initialize Stripe safely in both server and client contexts.

### Phase 2: Payment and Checkout State Design
- Introduce a dedicated payment-oriented data model separate from the order model.
- Define generic payment states such as pending, authorized, succeeded, failed, canceled, refunded, and expired.
- Add migration files using Prisma Migrate.
- Keep the design provider-agnostic rather than Stripe-specific.

### Phase 3: Checkout Session Creation
- Create a dedicated server endpoint to initialize a checkout session.
- Validate the authenticated user, address, cart contents, and totals.
- Create a pending payment state and return the Stripe session URL or ID to the frontend.
- Redirect the customer to Stripe-hosted checkout.

### Phase 4: Webhook Handling and Finalization
- Create a webhook endpoint to receive payment events.
- Verify webhook signatures server-side.
- Map provider events into the application’s generic payment states.
- Prevent duplicate event processing using idempotency checks.
- Create the final order only after successful payment confirmation.

### Phase 5: Order Completion
- Mark the order as paid only after the provider confirms success.
- Update the order status from awaiting payment to processing or confirmed.
- Decrement stock only after successful payment confirmation.
- Handle failed and canceled payments gracefully.
- Redirect the customer to a success or failure page based on the final outcome.

### Phase 6: Admin Integration
- Expose payment status and payment reference in the admin order pages.
- Allow admins to see whether an order is pending payment, paid, failed, or refunded.
- Ensure admin order management remains compatible with the new payment lifecycle.
- Show payment-related errors and last-known state in the admin interface.

### Phase 7: Testing
- Test successful payments.
- Test failed payments.
- Test canceled payments.
- Test webhook retries and duplicate delivery.
- Test idempotency and retries.
- Test order state transitions for each payment outcome.
- Verify that stock changes only after verified payment.

## Risks
The following risks should be reviewed before implementation:

1. Inventory mismatch
   - Stock is currently reduced immediately during order creation. This must be adjusted so stock changes only after payment is confirmed.

2. Duplicate order creation
   - The current flow creates an order as soon as checkout is submitted. A payment-based flow must avoid creating duplicate orders on retries or payment reloads.

3. Payment state drift
   - The order may be pending in the database while the provider has already succeeded or failed. Webhooks are required to reconcile this state.

4. Webhook reliability
   - Webhook delivery can be delayed or retried. The system must be resilient to repeated events.

5. Security exposure
   - Secret keys must never be exposed to the browser, and all provider verification must occur on the server.

6. Session and authentication issues
   - The current authentication flow uses NextAuth JWT sessions. Payment flows must be tied to authenticated users and protected routes.

7. Frontend state mismatch
   - The cart is client-side and persisted locally, so checkout must clearly rely on the server for authoritative order creation and payment state.

8. Currency and amount mismatch
   - The app must ensure the checkout amount sent to the provider matches the server-calculated order total exactly.

9. Partial failures
   - If payment creation succeeds but the verification step fails, the system must avoid marking the order incorrectly as paid or failed.

10. Admin workflow disruption
   - Existing admin order management currently updates order and payment status manually. The integration must not break this workflow.

11. Testing complexity
   - Checkout, payment, webhook, and order completion all interact. Testing must cover the full lifecycle end to end.

12. Provider dependency
   - The architecture should remain provider-agnostic so future changes to Stripe or another provider do not require rewriting the core order lifecycle.

## Recommended Implementation Approach
The best path is to introduce a payment-first order lifecycle rather than extending the current direct order creation flow in place.

Recommended sequence:
- Keep the current order experience for non-paid flows if needed.
- Introduce a dedicated payment initiation step through a checkout session.
- Create a pending payment state before the provider is engaged.
- Create the final order only after payment confirmation.
- Treat webhooks as the authoritative signal for final payment state.
