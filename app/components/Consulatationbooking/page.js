'use client';

import { useState, useEffect } from 'react';

export default function ConsultationBooking() {
  const [form, setForm] = useState({
    doctor: '',
    name: '',
    gender: '',
    email: '',
    phone: '',
    city: '',
    healthConcern: '',
    message: '',
    date: '',
    timeSlot: '',
    price: 0,
  });

  const doctorPrices = {
    Doctor1: 40,
    Doctor2: 30,
    Doctor3: 10,
  };

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

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && data.paymentSessionId) {
        const cashfree = Cashfree({ mode: 'production' });
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: '_self',
        });
      } else {
        alert(`Order creation failed: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.error('Submit Error:', error);
      alert('Something went wrong!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Book Your Paid Consultation Now!</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="border border-gray-300 p-2 rounded"
            value={form.doctor}
            onChange={handleDoctorChange}
            required
          >
            <option value="">Select Doctor</option>
            <option value="Doctor1">Doctor 1 - $40</option>
            <option value="Doctor2">Doctor 2 - $30</option>
            <option value="Doctor3">Doctor 3 - $10</option>
          </select>

          <input
            type="text"
            placeholder="Full Name"
            className="border border-gray-300 p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <select
            className="border border-gray-300 p-2 rounded"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 p-2 rounded"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Phone Number"
            className="border border-gray-300 p-2 rounded"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="City"
            className="border border-gray-300 p-2 rounded"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            required
          />

          <select
            className="border border-gray-300 p-2 rounded"
            value={form.healthConcern}
            onChange={(e) => setForm({ ...form, healthConcern: e.target.value })}
            required
          >
            <option value="">Select Health Concern</option>
            <option value="Hairfall">Hairfall</option>
            <option value="PCOS">PCOS</option>
            <option value="Diabetes">Diabetes</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="date"
            className="border border-gray-300 p-2 rounded"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />

          <select
            className="border border-gray-300 p-2 rounded"
            value={form.timeSlot}
            onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
            required
          >
            <option value="">Select Time Slot</option>
            <option value="10 AM - 12 PM">10 AM - 12 PM</option>
            <option value="2 PM - 4 PM">2 PM - 4 PM</option>
            <option value="6 PM - 8 PM">6 PM - 8 PM</option>
          </select>
        </div>

        <textarea
          placeholder="Share your symptoms"
          className="border border-gray-300 p-2 rounded w-full"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={4}
        ></textarea>

        <p className="text-lg font-semibold">Total Amount: ${form.price}</p>

        <button
          type="submit"
          className="w-full bg-yellow-500 text-white py-3 rounded text-lg hover:bg-yellow-600"
          
        >
          {'Book Consultation & Pay'}
        </button> 
      </form>
    </div>
  );
}
