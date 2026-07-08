# Razorpay Testing Guide

## Test mode
- Use Razorpay test credentials in the local environment.
- Keep the app in test mode while validating the checkout flow.

## Successful payment
1. Open the checkout page with a valid cart.
2. Choose a delivery address and place the order.
3. In the Razorpay modal, use the test card `4111 1111 1111 1111`.
4. Enter any future expiry and a 3-digit CVV.
5. Complete the payment and confirm the order success screen.

## Failed payment
1. Use the Razorpay test card `4000 0000 0000 0002`.
2. Complete the flow and confirm the order is marked as failed.

## Cancelled payment
1. Close the Razorpay modal or click the cancel action.
2. Confirm the checkout page shows the cancelled state.

## Webhook verification
1. Configure the Razorpay webhook endpoint in the Razorpay dashboard.
2. Set the webhook secret in `RAZORPAY_WEBHOOK_SECRET`.
3. Send test events and confirm the payment/order state updates.
