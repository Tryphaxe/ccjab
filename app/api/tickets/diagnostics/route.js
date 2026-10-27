import { NextResponse } from 'next/server';
import { authorize } from '@/lib/apiAuth';

export async function GET(request) {
  const auth = await authorize(request, ['ADMIN']);
  if (auth.response) return auth.response;

  const configured = {
    GENIUSPAY_API_KEY: Boolean(process.env.GENIUSPAY_API_KEY),
    GENIUSPAY_API_SECRET: Boolean(process.env.GENIUSPAY_API_SECRET),
    GENIUSPAY_WEBHOOK_SECRET: Boolean(process.env.GENIUSPAY_WEBHOOK_SECRET),
    APP_URL: Boolean(process.env.APP_URL),
  };

  return NextResponse.json({
    configured,
    onlinePaymentAvailable: Object.values(configured).every(Boolean),
    simulationAvailable: process.env.NODE_ENV !== 'production' && process.env.ENABLE_TICKET_PAYMENT_SIMULATION === 'true',
    production: process.env.NODE_ENV === 'production',
  });
}
