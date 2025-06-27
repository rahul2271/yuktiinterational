export const runtime = 'edge';

export async function POST(request) {
  try {
    const body = await request.json();
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
      console.error('Google Sheet Error:', sheetError);
    }

    // ✅ Generate valid customer_id
    const customerId = (email || phone || 'cust')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 30) || `cust_${Date.now()}`;

    // ✅ Call Cashfree API
    const cashfreeRes = await fetch('https://api.cashfree.com/pg/orders', {
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

    const cashfreeData = await cashfreeRes.json();
    console.log('Cashfree Response:', cashfreeData);

    if (!cashfreeRes.ok) {
      console.error('Cashfree Error:', cashfreeData);
      return new Response(
        JSON.stringify({
          error: 'Cashfree order creation failed',
          cashfreeError: cashfreeData
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ✅ Success - Return Payment Link
    return new Response(
      JSON.stringify({ paymentLink: cashfreeData.payment_link }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message || String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
