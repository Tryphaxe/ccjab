CREATE TYPE "TicketEmailStatus" AS ENUM ('PENDING', 'SENDING', 'SENT');

ALTER TABLE "TicketOrder"
ADD COLUMN "ticketEmailStatus" "TicketEmailStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "ticketEmailSentAt" TIMESTAMP(3);
