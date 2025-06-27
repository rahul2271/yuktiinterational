import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, country, phone, doctor, message, price } = body;

    console.log('Received Form Data:', body);

    // ✅ Save to Google Sheet
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
          status: 'pending'
        })
      });
    } catch (sheetError) {
      console.error('Google Sheet Save Error:', sheetError);
    }

    // ✅ Generate a valid customer_id (alphanumeric, underscore, hyphen only)
    const customerId = (email || phone || 'cust')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30) || `cust_${Date.now()}`;

    let cfData;
    try {
      // ✅ Create Cashfree Order
      const cashfreeResponse = await fetch('https://api.cashfree.com/pg/orders', {
        method: 'POST',
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          order_amount: price,
          order_currency: 'USD',
          customer_details: {
            customer_id: customerId,
            customer_email: email,
            customer_phone: phone,
            customer_name: name
          },
          order_meta: {
            return_url: `${process.env.SITE_URL}/payment-success?order_id={order_id}`
          }
        })
      });

      cfData = await cashfreeResponse.json();
      console.log('Cashfree API Response:', cfData);

      if (!cashfreeResponse.ok) {
        console.error('Cashfree API Error:', cfData);
        return NextResponse.json(
          { error: 'Cashfree order creation failed', cashfreeError: cfData },
          { status: 500 }
        );
      }
    } catch (cashfreeError) {
      console.error('Cashfree API Call Failed:', cashfreeError);
      return NextResponse.json(
        {
          error: 'Failed to call Cashfree API',
          details: cashfreeError.message || JSON.stringify(cashfreeError)
        },
        { status: 500 }
      );
    }

    // ✅ Success - Return Payment Link
    return NextResponse.json({ paymentLink: cfData.payment_link });

  } catch (error) {
    console.error('API Error:', error);

    let errorDetails = '';

    try {
      errorDetails = typeof error === 'object' ? JSON.stringify(error) : String(error);
    } catch (jsonError) {
      errorDetails = 'Unknown error (JSON stringify failed)';
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message || errorDetails || 'Unknown server error'
      },
      { status: 500 }
    );
  }
}
