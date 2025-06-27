const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    let data = {};
    try {
      data = await res.json();
    } catch (jsonError) {
      console.error('API Response was not valid JSON:', jsonError);
      alert(`Server returned invalid JSON. Status: ${res.status}`);
      return;
    }

    if (res.ok && data.paymentLink) {
      window.location.href = data.paymentLink;
    } else {
      console.error('API Error:', data);
      alert(
        `Order creation failed.\n\nStatus: ${res.status}\nReason: ${
          data?.cashfreeError?.message || data?.error || JSON.stringify(data) || 'Unknown server error'
        }`
      );
    }
  } catch (networkError) {
    console.error('Frontend Fetch Error:', networkError);
    alert('Network error: ' + (networkError.message || 'Unknown network error'));
  } finally {
    setLoading(false);
  }
};
