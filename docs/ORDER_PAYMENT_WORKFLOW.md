# Order Placement and Razorpay Payment Workflow

This document describes the current checkout and payment flow in the project.

## 1. Checkout page behavior

The checkout page is implemented in `src/app/checkout/page.tsx`.

- The user must be authenticated and have a session.
- The page loads saved shipping addresses from `/api/auth/profile`.
- A client-side idempotency key is generated and stored in `sessionStorage`.
- The user selects a shipping address and payment method.
- The user enters payment details for the selected method.
- The user clicks the place order button.

## 2. Payment Method selection

The checkout page offers these payment options:

- `UPI`
- `Credit Card`
- `Debit Card`
- `Cash On Delivery`

### What this means in the current flow

- The selected `paymentMethod` is sent to `/api/payment/create-order` and stored in the order/payment record.
- The page renders method-specific input fields:
  - `UPI` shows a UPI ID input.
  - `Credit Card` and `Debit Card` show card fields.
  - `Cash On Delivery` shows an informational message.
- However, the current implementation does not use these payment-specific details to change the payment provider flow.
- All methods currently proceed through Razorpay checkout; there is no separate offline COD flow implemented today.

### Practical consequence

- `UPI`, `Credit Card`, and `Debit Card` are currently only validated on the client side.
- The Razorpay checkout widget is still opened for every order submission, regardless of the chosen method.
- `Cash On Delivery` is treated as a selected method in the UI, but it does not bypass the online Razorpay payment flow in the current code.

### How to connect these methods properly

To make each payment option fully functional, the checkout logic should be expanded:

- For UPI / Credit Card / Debit Card:
  - either use Razorpay's built-in payment flow that supports those methods,
  - or pass selected method metadata into Razorpay and let the provider route the payment accordingly.
- For Cash On Delivery:
  - bypass Razorpay checkout entirely,
  - create the order with `paymentMethod: 'CASH_ON_DELIVERY'`, `status: 'PENDING'`, and `orderStatus` set to a COD-specific state,
  - and process the order as a cash-on-delivery order rather than an online payment.

## 3. Order creation endpoint

The checkout page sends a POST request to:

- `/api/payment/create-order`

Request payload:

- `shippingAddressId`: selected shipping address
- `paymentMethod`: selected payment method
- `idempotencyKey`: client-generated idempotency token
- `amount`: total order amount
- `items`: array of `{ productId, quantity }`

### Server-side processing in `src/app/api/payment/create-order/route.ts`

1. Verify the user session via `getServerSession(authOptions)`.
2. Validate that the user exists and the shipping address belongs to the user.
3. Validate the item list:
   - all products exist
   - quantities are positive
   - stock is sufficient
4. Calculate order totals using product prices and any discounts.
5. Compare the client-provided amount with the calculated total.
6. Build a deterministic order number using a SHA-256 hash of user/order payload.
7. Check if an order with the same `orderNumber` already exists.
8. If not, create a new `order` and a related `payment` record in the database with:
   - `provider: 'razorpay'`
   - `status: 'PENDING'`
   - `currency: 'INR'`
   - `metadata.idempotencyKey`
9. Create a Razorpay order using the Razorpay SDK (`src/lib/razorpay.ts`).
10. Update the payment record with Razorpay order details.
11. Return JSON to the client containing:
    - `order_id`: Razorpay order id
    - `amount`: Razorpay amount in paise
    - `currency`
    - `key_id`: `NEXT_PUBLIC_RAZORPAY_KEY_ID`
    - `orderId`: internal order id
    - `paymentId`: internal payment id
    - `customer`: prefill customer data

## 3. Client-side Razorpay checkout

After the `create-order` API responds, the client:

1. Loads the Razorpay checkout script via `loadRazorpayScript()`.
2. Creates a Razorpay `options` object with:
   - `key`: Razorpay key id
   - `amount`
   - `currency`
   - `order_id`: Razorpay order id
   - `name`, `description`
   - customer `prefill` metadata
   - `handler`: callback for successful payments
3. Opens the Razorpay checkout widget with `new window.Razorpay(options)`.
4. If payment fails, the checkout widget triggers `payment.failed` and displays an error.

## 4. Payment verification endpoint

When Razorpay returns a successful payment result, the client sends a POST request to:

- `/api/payment/verify`

Request payload:

- `orderId`: internal order id
- `paymentId`: internal payment id
- `razorpay_order_id`
- `razorpay_payment_id`
- `razorpay_signature`

### Server-side verification in `src/app/api/payment/verify/route.ts`

1. Validate all required fields are present.
2. Load the payment record by `paymentId` or `orderId`.
3. Compute the expected signature using:
   - `process.env.RAZORPAY_KEY_SECRET`
   - HMAC SHA-256 of `razorpay_order_id|razorpay_payment_id`
4. Compare the computed signature with the `razorpay_signature` from Razorpay.
5. If the signature is invalid:
   - update payment `status` to `FAILED`
   - update order `paymentStatus` to `FAILED`
   - return an error response
6. If the signature is valid:
   - update payment status to `PAID`
   - store `providerSessionId`, `razorpayPaymentId`, `paymentSignature`
   - set `paidAt`, `capturedAt`, and `lastEvent`
   - update order status to `CONFIRMED`
7. Return success to the client.

## 5. Razorpay webhook handling

The project also includes a Razorpay webhook route at:

- `/api/webhooks/razorpay`

This route:

1. Reads the raw request body and the `x-razorpay-signature` header.
2. Verifies the request body using `RAZORPAY_WEBHOOK_SECRET`.
3. Parses Razorpay event data.
4. Uses the `notes` object on the Razorpay payment entity to find internal `orderId` and `paymentId`.
5. Handles event types:
   - `payment.captured` or `payment.authorized`: mark payment `PAID` and order `CONFIRMED`
   - `payment.failed`: mark payment `FAILED` and order `PAYMENT_FAILED`
   - `refund.processed`: mark payment `REFUNDED`

## 6. Summary of the current flow

- Checkout page submits an order request to `/api/payment/create-order`.
- The server creates an internal order and payment record, then creates a Razorpay order.
- The client opens Razorpay checkout using the returned Razorpay order data.
- On successful payment, the client calls `/api/payment/verify` to verify the payment signature and finalize the order.
- Razorpay webhooks provide asynchronous reconciliation for payment events.

## 7. Key files

- `src/app/checkout/page.tsx` — checkout UI and client payment flow
- `src/app/api/payment/create-order/route.ts` — order creation and Razorpay order initialization
- `src/app/api/payment/verify/route.ts` — Razorpay payment verification
- `src/app/api/webhooks/razorpay/route.ts` — Razorpay webhook handler
- `src/lib/razorpay.ts` — Razorpay SDK initialization and browser script loader

## 8. Important notes

- The payment flow is Razorpay-only.
- There is no Stripe integration in the active source code.
- The `/api/payment/create-order` endpoint is the entry point for order creation.
- The order is only finalized after Razorpay payment verification.
- The webhook route is a secondary reconciliation path for Razorpay events.
