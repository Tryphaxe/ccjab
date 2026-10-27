ALTER TYPE "TicketPaymentProvider" ADD VALUE IF NOT EXISTS 'GENIUSPAY';
ALTER TYPE "TicketOrderStatus" ADD VALUE IF NOT EXISTS 'REFUND_REQUIRED';

ALTER TABLE "TicketOrder"
ADD COLUMN "geniusPayReference" TEXT;

CREATE UNIQUE INDEX "TicketOrder_geniusPayReference_key"
ON "TicketOrder"("geniusPayReference");

CREATE TABLE "GeniusPayWebhookEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    CONSTRAINT "GeniusPayWebhookEvent_pkey" PRIMARY KEY ("id")
);
