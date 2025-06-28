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
    <div className="bg-gradient-to-r from-[#1a2d5a] via-[#152e50] to-[#0c0f1a] text-white min-h-screen font-poppins px-4 py-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Left Panel */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">Tired of just managing symptoms?</h1>
          <p className="text-gray-300">Many patients came to us after trying everything. Our Ayurvedic approach focuses on <em>you</em>—not just the disease—for root-cause healing.</p>

          <div>
            <h3 className="text-xl font-semibold">Meet <span className="text-yellow-400">Dr. Suhas Sakhare (MD, PhD Ayurveda)</span></h3>
            <p className="text-gray-400">15+ years experience • 8000+ patients globally</p>
          </div>

          <ul className="text-sm space-y-1 text-gray-400">
            <li>✅ 1-on-1 Consultation (Call / Video)</li>
            <li>✅ Personalized Ayurvedic Diagnosis</li>
            <li>✅ Herbal treatment plan + lifestyle support</li>
            <li>✅ Global patient care (USD Payments)</li>
          </ul>

          <div className="bg-white/10 border border-yellow-400 p-4 rounded-lg w-64 text-center">
            <p className="text-lg">💰 Consultation Fee:</p>
            <p className="text-yellow-300 text-2xl">${form.price}</p>
          </div>
        </div>

        {/* Right Panel (Form) */}
        <form onSubmit={handleSubmit} className="glass p-6 rounded-xl space-y-4 shadow-lg bg-white/10">
          {/* Doctor & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select required value={form.doctor} onChange={handleDoctorChange} className="bg-white text-black rounded p-2 text-sm">
              <option value="">Select Doctor</option>
              {Object.keys(doctorPrices).map((doc) => (
                <option key={doc}>{doc}</option>
              ))}
            </select>
            <input type="text" required placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white text-black rounded p-2 text-sm" />
          </div>

          {/* Gender / Email / Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select required value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="bg-white text-black rounded p-2 text-sm">
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white text-black rounded p-2 text-sm" />
            <input type="tel" required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white text-black rounded p-2 text-sm" />
          </div>

          {/* Country & City */}
          <input type="text" required placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="bg-white text-black rounded p-2 text-sm w-full" />
          <input type="text" required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-white text-black rounded p-2 text-sm w-full" />

          {/* Health Concern */}
          <select required value={form.healthConcern} onChange={(e) => setForm({ ...form, healthConcern: e.target.value })} className="bg-white text-black rounded p-2 text-sm w-full">
            <option value="">Health Concern</option>
            <option>IBS</option>
            <option>IBD</option>
            <option>Ulcerative Colitis</option>
            <option>Autoimmune Disorders</option>
            <option>Infertility</option>
            <option>Other</option>
          </select>

          {/* Symptoms */}
          <textarea rows="3" required placeholder="Briefly describe your symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="bg-white text-black rounded p-2 text-sm w-full"></textarea>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" required value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} className="bg-white text-black rounded p-2 text-sm" />
            <input type="time" required value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} className="bg-white text-black rounded p-2 text-sm" />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded text-lg font-semibold transition">
            {loading ? 'Processing...' : `Book Appointment & Pay $${form.price}`}
          </button>

          {/* Payment Icons */}
          <div className="flex justify-center gap-4 mt-6 text-white text-2xl">
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fab fa-google-pay"></i>
            <i className="fab fa-paypal"></i>
          </div>
        </form>
      </div>
    </div>
  );
}
