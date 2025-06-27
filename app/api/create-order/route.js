export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, country, phone, doctor, message, price } = body;

    console.log('Received Form Data:', body);

    // ✅ Save data to Google Sheet (optional)
    try {
      await fetch(process.env.SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          country,
          phone,
          doctor,
          message,
          price,
          status: 'pending',
        }),
      });
    } catch (sheetError) {
      console.error('Google Sheet Save Error:', sheetError);
    }

    // ✅ Generate a safe customer_id
    const customerId = (email || phone || 'cust')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30) || `cust_${Date.now()}`;

    // ✅ Create Cashfree Order
    const cashfreeResponse = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_amount: price,
        order_currency: 'USD',
        customer_details: {
          customer_id: customerId,
          customer_email: email,
          customer_phone: phone,
          customer_name: name,
        },
        order_meta: {
          return_url: `${process.env.SITE_URL}/payment-success?order_id={order_id}`,
        },
      }),
    });

    const cfData = await cashfreeResponse.json();
    console.log('Cashfree API Response:', cfData);

    if (!cashfreeResponse.ok || !cfData.payment_session_id) {
      console.error('Cashfree API Error:', cfData);
      return NextResponse.json(
        { error: 'Cashfree Payment Link API call failed', cashfreeError: cfData },
        { status: 500 }
      );
    }

    // ✅ Return paymentSessionId
    return NextResponse.json({ paymentSessionId: cfData.payment_session_id });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message || 'Unknown server error',
      },
      { status: 500 }
    );
  }
}
