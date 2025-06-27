'use client';
import { useState } from 'react';

export default function ConsultationBooking() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    phone: '',
    doctor: '',
    message: '',
    price: 0
  });
  const [loading, setLoading] = useState(false);

  const doctorPrices = {
    Doctor1: 40,
    Doctor2: 30,
    Doctor3: 10
  };

  const handleDoctorChange = (e) => {
    const doctor = e.target.value;
    setForm({ ...form, doctor, price: doctorPrices[doctor] });
  };

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
        console.error('Non-JSON response from API:', jsonError);
        alert('Server returned non-JSON response. Please check server logs.');
        return;
      }

      if (res.ok && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        console.error('API Error:', data);
        alert(
          `Order creation failed:\n\n${
            data?.cashfreeError?.message || data?.error || 'Unknown server error'
          }`
        );
      }
    } catch (error) {
      console.error('Frontend Fetch Error:', error);
      alert('Submit failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Yukti Herbs - International Consultation Booking</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        /><br />

        <input
          placeholder="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        /><br />

        <input
          placeholder="Country"
          required
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        /><br />

        <input
          placeholder="Phone"
          required
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        /><br />

        <select required value={form.doctor} onChange={handleDoctorChange}>
          <option value="">Select Doctor</option>
          <option value="Doctor1">Doctor 1 - $40</option>
          <option value="Doctor2">Doctor 2 - $30</option>
          <option value="Doctor3">Doctor 3 - $10</option>
        </select><br />

        <textarea
          placeholder="Symptoms / Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        ></textarea><br />

        <p><strong>Total Amount:</strong> ${form.price}</p>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Book Consultation & Pay'}
        </button>
      </form>
    </div>
  );
}
