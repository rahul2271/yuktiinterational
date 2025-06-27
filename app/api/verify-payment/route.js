import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');

  try {
    const cashfreeResponse = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    });

    const cfData = await cashfreeResponse.json();
    return NextResponse.json({ status: cfData.order_status });

  } catch (error) {
    console.error('Verification Error:', error);
    return NextResponse.json({ error: 'Verification failed', details: error.message }, { status: 500 });
  }
}
