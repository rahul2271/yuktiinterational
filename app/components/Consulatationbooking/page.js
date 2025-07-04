// Enhanced Consultation Booking Form with Premium UI
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { DateTime } from 'luxon';


const InputField = ({ label, ...props }) => (
  <div className="relative">
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm text-sm"
    />
  </div>
)

const SelectField = ({ label, value, onChange, options = [], required = false, disabledOptions = [] }) => (
  <div className="relative">
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm text-sm"
    >
      <option value="">Select {label}</option>
      {options.map((opt, idx) => (
        <option key={idx} disabled={disabledOptions?.includes(opt)}>
          {opt}
        </option>
      ))}
    </select>
  </div>
)

const TextAreaField = ({ label, value, onChange }) => (
  <div className="relative col-span-1 sm:col-span-2">
    <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
    <textarea
      rows={4}
      value={value}
      onChange={onChange}
      required
      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm text-sm resize-none"
    />
  </div>
)

export default function ConsultationBooking() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    doctor: '', name: '', gender: '', email: '', phone: '', country: '', city: '', healthConcern: '', symptoms: '', preferredDate: '', preferredTime: '', timeZone: '', price: 0, originalPrice: 0
  });
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [countdown, setCountdown] = useState(3600);
  const formRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          alert("⏰ Offer expired! Redirecting to main page.");
          window.location.href = '/';
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = () => {
    const m = String(Math.floor(countdown / 60)).padStart(2, '0');
    const s = String(countdown % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const doctors = [
    { name: 'Dr. Suhas Sakhare', photo: './drsuhas.png', degrees: 'MD, PhD, DYT', desc: 'Ayurvedic Gastroenterologist', experience: '10+ years', price: 100, discountedPrice: 50, availability: 'Mon-Sat, 11:00 AM - 6:00 PM IST', expertise: ['Ulcerative Colitis', 'Crohn’s Disease', 'IBS'] },
    { name: 'Dr. Manpreet Singh', photo: './2.png', degrees: 'BAMS, MD (Ayurveda)', desc: 'Ayurveda Consultant', experience: '5+ years', price: 60, discountedPrice: 30, availability: 'Mon-Sat, 11:00 AM - 6:00 PM IST', expertise: ['Psoriasis', 'Acne', 'Fatty Liver'] },
    { name: 'Dr. Sandeep Singh', photo: './drsandeep.png', degrees: 'BAMS, MD (Ayurveda)', desc: 'Ayurveda Consultant', experience: '5+ years', price: 60, discountedPrice: 30, availability: 'Mon-Sat, 11:00 AM - 6:00 PM IST', expertise: ['CRD', 'UTI', 'Male & Female Infertility Issues'] },
    { name: 'Dr. Yashasvi Chandel', photo: './dryash.png', degrees: 'BAMS, MD (Ayurveda)', desc: 'Ayurveda Consultant', experience: '5+ years', price: 60, discountedPrice: 30, availability: 'Mon-Sat, 11:00 AM - 6:00 PM IST', expertise: ['Female Infertility', 'PCOS / PCOD and Hormone imbalance', 'Obesity & Metabolic Health'] },
  ];

  const generateSlots = () => {
    const slots = [];
    for (let h = 10; h < 18; h++) {
      ['00', '15', '30', '45'].forEach(min => slots.push(`${h.toString().padStart(2, '0')}:${min}`));
    }
    return slots;
  };

  useEffect(() => {
    document.body.appendChild(Object.assign(document.createElement('script'), {
      src: 'https://sdk.cashfree.com/js/v3/cashfree.js', async: true
    }));
    const allCountries = countryList().getData();
    setCountries(allCountries);
    setForm(prev => ({ ...prev, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(data => {
        if (data?.country_name && data?.city) {
          const countryObj = allCountries.find(c => c.label === data.country_name);
          setForm(prev => ({ ...prev, country: countryObj?.label || '', city: data.city }));
        }
      });
  }, []);

  useEffect(() => {
    if (form.country) {
      fetch(`https://countriesnow.space/api/v0.1/countries/cities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: form.country })
      })
        .then(res => res.json())
        .then(data => setCities(data.data || []));
    }
  }, [form.country]);

  useEffect(() => {
    if (form.preferredDate && form.doctor) {
      fetch(`/api/booked-slots?doctor=${form.doctor}&date=${form.preferredDate}`)
        .then(res => res.json())
        .then(data => setBookedSlots(data.booked || []));
    }
  }, [form.preferredDate, form.doctor]);

  const handleDoctorSelect = (doctor) => {
    setForm({ ...form, doctor: doctor.name, price: doctor.discountedPrice, originalPrice: doctor.price });
    setStep(2);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const [year, month, day] = form.preferredDate.split('-').map(Number);
    const [hour, minute] = form.preferredTime.split(':').map(Number);
    const localTime = DateTime.fromObject({ year, month, day, hour, minute }, { zone: form.timeZone });
    const indiaTime = localTime.setZone('Asia/Kolkata').toFormat('yyyy-LL-dd HH:mm');

    const payload = {
      ...form,
      preferredTimeIndia: indiaTime,
      discountApplied: form.originalPrice !== form.price,
    };

    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok && data.paymentSessionId) {
      const cashfree = Cashfree({ mode: 'production' });

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: '_self',
        onSuccess: () => {
          console.log('✅ Payment successful');
          setIsSuccess(true);
        },
        onFailure: (err) => {
          console.error('❌ Cashfree failure:', err);
          alert('Payment failed. Please try again.');
        },
      });
    } else {
      console.error('❌ Payment initiation failed:', data);
      alert('Payment failed: ' + (data.error || 'Unknown error occurred.'));
    }
  } catch (err) {
    console.error('❌ Submit error:', err);
    alert('Something went wrong while processing your booking.');
  } finally {
    setLoading(false);
  }
};


 

  


  return (
    <div className="min-h-screen bg-white to-[#fef6df] text-gray-800 font-sans">
      <div className="bg-yellow-50 border-b border-yellow-200 py-2 text-center text-sm text-yellow-800 font-semibold tracking-wide shadow-sm">
        🎉 Limited Period <strong className="text-red-600">50% OFF</strong> - Book Your Slot Now! Offer Ends In:
        <motion.span className="ml-2 font-mono text-lg text-red-500 animate-pulse" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>{formatCountdown()}</motion.span>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16">
  {step === 1 && (
    <section>
      <h2 className="text-4xl font-extrabold text-center text-[#0a1e3f] mb-4 tracking-tight">Meet Your Ayurvedic Experts</h2>
      <p className="text-center text-gray-500 text-lg mb-12 max-w-2xl mx-auto">Hand-picked specialists trusted by thousands globally for personalized root-cause healing.</p>

      <div className="grid gap-10 lg:grid-cols-2">
        {doctors.map((doc, idx) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            whileHover={{ scale: 1.03 }}
            className="relative bg-white/20 backdrop-blur-md border border-yellow-200/30 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] p-8 transition-all"
          >
            <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 text-[11px] font-semibold rounded-bl-xl shadow z-10">
              Verified & Trusted
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={doc.photo}
                alt={doc.name}
                className="w-[120px] h-[120px] rounded-full object-cover border-4 border-yellow-400 shadow-lg"
              />
              <div className="text-[#0f172a]">
                <h3 className="text-2xl font-bold">{doc.name}</h3>
                <p className="text-sm text-yellow-600 font-medium mt-1">{doc.degrees}</p>
                <p className="text-sm italic text-gray-500 mt-1">{doc.desc}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-gray-800 text-sm">
              <div className="flex items-center gap-2">
                <i className="fas fa-briefcase text-yellow-400"></i>
                <span><strong>Experience:</strong> {doc.experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-clock text-yellow-400"></i>
                <span><strong>Available:</strong> {doc.availability}</span>
              </div>
              <div className="sm:col-span-2 flex items-center flex-wrap gap-2 mt-2">
                <i className="fas fa-wallet text-yellow-400"></i>
                <span className="line-through text-red-400">${doc.price}</span>
                <span className="text-green-700 font-bold text-lg">${doc.discountedPrice}</span>
                <span className="bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">Limited Offer</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5">
              {doc.expertise.map((item, idx) => (
                <span
                  key={idx}
                  className="bg-yellow-50 border border-yellow-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleDoctorSelect(doc)}
              className="mt-8 w-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-[#0a1e3f] font-bold py-3 rounded-xl text-lg tracking-wide transition-transform hover:-translate-y-1 shadow-md"
            >
              Book Now with {doc.name}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Optional trust strip */}
      <div className="mt-16 flex justify-center">
        <img src="/trusted-by.png" alt="As seen in" className="h-8 opacity-70" />
      </div>
    </section>
  )}



{step === 2 && (
  
  <motion.section
    ref={formRef}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
    className="relative px-4 sm:px-6 lg:px-16 py-10"
  >
    
    {/* Background Accent Blur */}
    <div className="absolute inset-0 z-0 bg-gradient-to-tr from-white via-blue-50 to-white opacity-80 backdrop-blur-sm rounded-3xl" />

    {/* Card Wrapper */}
    <div className="relative z-10 bg-white border border-gray-200 shadow-2xl rounded-3xl px-6 sm:px-10 py-10 sm:py-14 max-w-4xl mx-auto transition-all duration-300">
       <div className="text-left mb-6">
      <button
        onClick={() => setStep(1)}
        className="inline-flex items-center text-sm text-blue-700 hover:text-blue-900 hover:underline transition"
      >
        ← Back to Doctor Selection
      </button>
    </div>
      {/* Header with Trust Badges */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">Your Private Ayurvedic Consultation</h2>
        <p className="text-sm text-gray-500 mt-2">with <span className="font-semibold text-blue-800">{form.doctor}</span></p>
        
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-300 shadow flex items-center gap-2">
            <i className="fas fa-user-shield"></i> WHO-Certified Clinic
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300 shadow flex items-center gap-2">
            <i className="fas fa-video"></i> 1-on-1 Encrypted Video/Audio Call
          </div>
          <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full border border-yellow-300 shadow flex items-center gap-2">
            <i className="fas fa-globe"></i> International Patients Welcome
          </div>
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <InputField label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <SelectField label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} options={['Male', 'Female']} required />

        <InputField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <InputField label="Phone (+ Country Code)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />

        <div className="col-span-1 sm:col-span-2">
          <Select
            options={countries}
            onChange={(val) => setForm({ ...form, country: val.label })}
            className="text-sm border border-gray-300 rounded-xl shadow-sm"
            placeholder="Select Country"
          />
        </div>
        <SelectField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} options={cities} required />

        <SelectField label="Health Concern" value={form.healthConcern} onChange={(e) => setForm({ ...form, healthConcern: e.target.value })} options={['IBS', 'Ulcerative Colitis', 'Autoimmune Disorders', 'Infertility', 'Other']} required />
        <TextAreaField label="Describe Your Symptoms" value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />

        <InputField label="Preferred Date" type="date" value={form.preferredDate} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} required />
        <SelectField label="Preferred Time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} options={generateSlots()} required disabledOptions={bookedSlots} />

        <div className="col-span-1 sm:col-span-2">
          <input
            type="text"
            readOnly
            value={form.timeZone}
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-600"
          />
        </div>

        {/* Pricing and CTA */}
        <div className="col-span-1 sm:col-span-2 text-center mt-4">
          <div className="text-green-700 text-sm flex justify-center items-center gap-2 mb-1">
            <i className="fas fa-lock"></i> Secured by Cashfree | HIPAA Compliant
          </div>
          <div className="text-2xl font-bold text-yellow-700">
            Total: <span className="text-blue-800">${form.price}</span>
          </div>
        </div>

        <div className="col-span-1 sm:col-span-2 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:to-yellow-600 text-white rounded-xl text-lg font-bold shadow-lg transition active:scale-95"
          >
            {loading ? 'Processing...' : `Pay $${form.price} & Book Consultation`}
          </button>
        </div>
      </form>

      {/* What Happens After */}
      <div className="mt-10 text-sm bg-blue-50 text-blue-900 p-5 rounded-xl border border-blue-200 shadow-sm leading-relaxed">
        <p className="font-semibold mb-2">✅ What to Expect After Booking:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>You receive confirmation with a consultation ID.</li>
          <li>Live Zoom/Meet link will be sent 24 hours before appointment.</li>
          <li>Your private 1-on-1 call (video/audio) is conducted by the assigned doctor.</li>
          <li>Personalized diet & prescription emailed within 12 hours post-call.</li>
          <li>Free WhatsApp support for 7 days after your appointment.</li>
        </ul>
      </div>

      {/* Footer Social Proof */}
      <div className="mt-6 text-center text-xs text-gray-400">
        10,000+ Patients Worldwide | Trusted in 25+ Countries | 100% Ayurvedic
      </div>
    </div>
  </motion.section>
)}

      </main>

      <footer className="bg-white text-center text-gray-500 py-6 text-sm border-t mt-12">
        <div>© 2025 Yukti Herbs. All rights reserved.</div>
        <div className="mt-2 flex justify-center gap-4 text-xs text-gray-400">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Refund Policy</span>
        </div>
      </footer>
    </div>
  );
};