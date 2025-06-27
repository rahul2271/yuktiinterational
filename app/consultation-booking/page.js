'use client';
import { useState, useEffect } from 'react';

export default function ConsultationBooking() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    phone: '',
    doctor: '',
    message: '',
    price: 0,
  });
  const [loading, setLoading] = useState(false);

  const doctorPrices = {
    Doctor1: 40,
    Doctor2: 30,
    Doctor3: 10,
  };

  // ✅ Load Cashfree JS SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleDoctorChange = (e) => {
    const doctor = e.target.value;
    setForm({ ...form, doctor, price: doctorPrices[doctor] || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.paymentSessionId) {
        console.log('Received paymentSessionId:', data.paymentSessionId);

        if (typeof window !== 'undefined' && window.Cashfree) {
          const cashfree = Cashfree({ mode: 'production' });

          cashfree.checkout({
            paymentSessionId: data.paymentSessionId,
            redirectTarget: '_self', // Change to '_blank' or '_modal' if needed
          });
        } else {
          alert('Cashfree SDK not loaded');
        }
      } else {
        console.error('API Error:', data);
        alert(
          `Order creation failed.\n\nStatus: ${res.status}\nReason: ${JSON.stringify(
            data
          )}`
        );
      }
    } catch (error) {
      console.error('Form Submit Error:', error);
      alert('Something went wrong! Please try again.');
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
