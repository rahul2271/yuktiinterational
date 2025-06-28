'use client';
import { useState, useEffect } from 'react';

export default function ConsultationBooking() {
  const [form, setForm] = useState({
    doctor: '',
    name: '',
    gender: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    healthConcern: '',
    symptoms: '',
    preferredDate: '',
    preferredTime: '',
    price: 0,
  });

  const [loading, setLoading] = useState(false);

  const doctorPrices = {
    'Dr. Suhas Sakhare': 50,
    'Dr. Manpreet Singh': 30,
    'Dr. Sandeep Singh': 30,
    'Dr. Yashasvi Chandel': 30,
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleDoctorChange = (e) => {
    const selectedDoctor = e.target.value;
    setForm({
      ...form,
      doctor: selectedDoctor,
      price: doctorPrices[selectedDoctor] || 0,
    });
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
        const cashfree = Cashfree({ mode: 'production' });
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: '_self',
        });
      } else {
        alert('Payment failed: ' + (data.error || JSON.stringify(data)));
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0c0f1a] via-[#152e50] to-[#1a2d5a] text-white min-h-screen font-sans">

      {/* Header */}
      <header className="bg-[#0c0f1a] py-4 shadow-md text-center">
        <h1 className="text-3xl font-bold text-yellow-400">Yukti Herbs - Global Consultation</h1>
        <p className="text-gray-400 text-sm">Natural Healing for International Patients</p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Left Intro Panel */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold mb-4">Root-Cause Healing Awaits</h2>
          <p className="text-gray-300 mb-6">
            Over 8,000 patients globally trust Yukti Herbs for personalized Ayurvedic care.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/10 shadow border border-yellow-300">
              ✅ 1-on-1 Consultation (Video or Phone)
            </div>
            <div className="p-4 rounded-lg bg-white/10 shadow border border-yellow-300">
              ✅ Diagnosis based on your Prakriti
            </div>
            <div className="p-4 rounded-lg bg-white/10 shadow border border-yellow-300">
              ✅ Herbal + Lifestyle Plan
            </div>
            <div className="p-4 rounded-lg bg-white/10 shadow border border-yellow-300">
              ✅ USD International Payments Supported
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-2xl shadow-lg space-y-6">
          {/* Doctor + Name */}
          <div className="grid md:grid-cols-2 gap-4">
            <select required value={form.doctor} onChange={handleDoctorChange} className="p-3 rounded bg-white text-black text-sm">
              <option value="">Select Doctor</option>
              {Object.keys(doctorPrices).map((doc) => (
                <option key={doc}>{doc}</option>
              ))}
            </select>
            <input type="text" required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-3 rounded bg-white text-black text-sm" />
          </div>

          {/* Gender / Email / Phone */}
          <div className="grid md:grid-cols-3 gap-4">
            <select required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="p-3 rounded bg-white text-black text-sm">
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="p-3 rounded bg-white text-black text-sm" />
            <input type="tel" required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="p-3 rounded bg-white text-black text-sm" />
          </div>

          {/* Country / City */}
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" required placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="p-3 rounded bg-white text-black text-sm" />
            <input type="text" required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="p-3 rounded bg-white text-black text-sm" />
          </div>

          {/* Health Concern */}
          <select required value={form.healthConcern} onChange={(e) => setForm({ ...form, healthConcern: e.target.value })} className="p-3 rounded bg-white text-black text-sm w-full">
            <option value="">Select Health Concern</option>
            <option>IBS</option>
            <option>IBD</option>
            <option>Ulcerative Colitis</option>
            <option>Autoimmune Disorders</option>
            <option>Infertility</option>
            <option>Other</option>
          </select>

          {/* Symptoms */}
          <textarea rows="3" required placeholder="Briefly describe your symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="p-3 rounded bg-white text-black text-sm w-full"></textarea>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <input type="date" required value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} className="p-3 rounded bg-white text-black text-sm" />
            <input type="time" required value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="p-3 rounded bg-white text-black text-sm" />
          </div>

          {/* Total Amount */}
          <div className="text-lg font-semibold text-yellow-300">Total: ${form.price}</div>

          {/* Submit Button */}
          <button disabled={loading} type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black py-3 w-full rounded-lg font-semibold text-lg transition-all">
            {loading ? 'Processing...' : `Pay $${form.price} & Book`}
          </button>

          {/* Payment Icons */}
          <div className="flex justify-center gap-6 text-white text-3xl mt-6">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-google-pay"></i>
            <i className="fab fa-paypal"></i>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-[#0c0f1a] text-center text-gray-500 py-4 mt-10 text-sm border-t border-gray-700">
        © 2025 Yukti Herbs. All rights reserved. | Ayurvedic Healing for the World.
      </footer>
    </div>
  );
}
