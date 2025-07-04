// app/api/booked-slots/route.js

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const doctor = searchParams.get('doctor');
  const date = searchParams.get('date');

  if (!doctor || !date) {
    return new Response(JSON.stringify({ error: 'Missing doctor or date' }), {
      status: 400,
    });
  }

  try {
    // Replace this with your actual SheetDB API URL
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/j7iiiww631ahq'

    // Build URL with filters: search by doctor and date
    const apiUrl = `${SHEETDB_URL}/search?doctor=${encodeURIComponent(doctor)}&date=${encodeURIComponent(date)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) {
      console.error('❌ SheetDB fetch failed:', res.status);
      return new Response(JSON.stringify({ error: 'Failed to fetch from SheetDB' }), {
        status: 500,
      });
    }

    const data = await res.json();

    // Extract the 'time' field from each matching row
    const bookedSlots = data.map(row => row.time).filter(Boolean);

    return new Response(JSON.stringify({ booked: bookedSlots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('❌ API Error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
    });
  }
}
