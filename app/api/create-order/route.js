export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      doctor,
      name,
      gender,
      email,
      phone,
      country,
      city,
      healthConcern,
      symptoms,
      preferredDate,
      preferredTime,
      price,
    } = body;

    console.log('Received Form Data:', body);

    // ✅ Save to SheetDB
    try {
      const sheetResponse = await fetch(process.env.SHEET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [
            {
              Timestamp: new Date().toISOString(),
              Doctor: doctor,
              Name: name,
              Gender: gender,
              Email: email,
              Phone: phone,
              Country: country,
              City: city,
              HealthConcern: healthConcern,
              Symptoms: symptoms,
              PreferredDate: preferredDate,
              PreferredTime: preferredTime,
              Price: price,
              Status: 'pending',
            },
          ],
        }),
      });

      const sheetResult = await sheetResponse.json();
      console.log('SheetDB Save Result:', sheetResult);
    } catch (sheetError) {
      console.error('SheetDB Save Error:', sheetError);
    }

    // ✅ Generate customer_id for Cashfree
    const customerId = (email || phone || 'cust')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30) || `cust_${Date.now()}`;

    // ✅ Call Cashfree Order API
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

    // ✅ Return payment session id for Cashfree Checkout
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
