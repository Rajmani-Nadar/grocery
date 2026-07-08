-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PAID';

ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_FAILED';

-- AlterTable
ALTER TABLE "Payment"
ADD COLUMN "razorpayOrderId" TEXT,
ADD COLUMN "razorpayPaymentId" TEXT,
ADD COLUMN "paymentSignature" TEXT;
