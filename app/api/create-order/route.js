export const runtime = 'edge';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, country, phone, doctor, message, price } = body;

    console.log('Received Form Data:', body);

    // ✅ Save to Google Sheets
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

    // ✅ Generate customer_id
    const customerId = (email || phone || 'cust')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30) || `cust_${Date.now()}`;

    let cfData;

    try {
      const cashfreeRes = await fetch('https://api.cashfree.com/pg/payment_links', {
        method: 'POST',
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': '2022-09-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_details: {
            customer_id: customerId,
            customer_email: email,
            customer_phone: phone,
            customer_name: name
          },
          link_notify: {
            send_sms: true,
            send_email: true
          },
          link_meta: {
            return_url: `${process.env.SITE_URL}/payment-success?order_id={order_id}`
          },
          link_amount: price,
          link_currency: 'USD',
          link_purpose: 'International Doctor Consultation'
        })
      });

      cfData = await cashfreeRes.json();
      console.log('Cashfree Payment Link API Response:', JSON.stringify(cfData, null, 2));

      if (!cashfreeRes.ok) {
        console.error('Cashfree Payment Link API Error:', cashfreeRes.status, cfData);
        return NextResponse.json(
          { error: 'Cashfree Payment Link API call failed', cashfreeError: cfData },
          { status: 500 }
        );
      }

      if (cfData.payment_link_url) {
        console.log('Payment Link:', cfData.payment_link_url);
        return NextResponse.json({ paymentLink: cfData.payment_link_url });
      } else {
        console.error('Cashfree did not return payment_link_url:', cfData);
        return NextResponse.json(
          { error: 'Cashfree did not return payment_link_url', cashfreeResponse: cfData },
          { status: 500 }
        );
      }

    } catch (cashfreeError) {
      console.error('Cashfree API Fetch Exception:', cashfreeError);
      return NextResponse.json(
        { error: 'Failed to call Cashfree API', details: cashfreeError.message || JSON.stringify(cashfreeError) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Final API Error:', error);

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
