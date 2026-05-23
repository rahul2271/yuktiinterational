'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { DateTime } from 'luxon';

// --- Reusable UI Components ---

const SectionHeader = ({ step, title, subtitle }) => (
  <div className="mb-6 border-b border-gray-100 pb-4">
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
        {step}
      </span>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    {subtitle && <p className="text-sm text-gray-500 mt-1 ml-11">{subtitle}</p>}
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="relative">
    <label className="block mb-1.5 text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
      <input
        {...props}
        className={`w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm text-sm ${icon ? 'pl-10' : ''}`}
      />
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options = [], required = false, disabledOptions = [] }) => (
  <div className="relative">
    <label className="block mb-1.5 text-sm font-semibold text-gray-700">{label}</label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm text-sm appearance-none"
    >
      <option value="" disabled>Select {label}</option>
      {options.map((opt, idx) => (
        <option key={idx} disabled={disabledOptions?.includes(opt)}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default function ConsultationBooking() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    doctor: '', name: '', gender: '', email: '', phone: '', country: '', city: '', healthConcern: '', symptoms: '', preferredDate: '', preferredTime: '', timeZone: '', price: 0, originalPrice: 0
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [countdown, setCountdown] = useState(3600);
  const formRef = useRef(null);

  // Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = '/';
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
    { 
      name: 'Dr. Suhas Sakhare', photo: './drsuhas.png', degrees: 'MD, PhD, DYT', desc: 'Ayurvedic Gastroenterologist', experience: '10+ years', price: 100, discountedPrice: 50, availability: 'Mon-Sat, 11:00 AM - 6:00 PM IST', expertise: ['Ulcerative Colitis', 'Crohn’s Disease', 'IBS'] 
    },
    { 
      name: 'Dr. Manpreet Singh', photo: './2.png', degrees: 'BAMS, MD (Ayurveda)', desc: 'Ayurveda Consultant', experience: '5+ years', price: 60, discountedPrice: 30, availability: 'Mon-Sat, 11:00 AM - 6:00 PM IST', expertise: ['Psoriasis', 'Acne', 'Fatty Liver'] 
    },
  ];

  // Generate Slots matching Doctor Availability (11 AM to 5:45 PM)
  const generateSlots = () => {
    const slots = [];
    for (let h = 11; h < 18; h++) {
      ['00', '15', '30', '45'].forEach(min => slots.push(`${h.toString().padStart(2, '0')}:${min}`));
    }
    return slots;
  };
  const availableSlots = generateSlots();

  useEffect(() => {
    document.body.appendChild(Object.assign(document.createElement('script'), {
      src: 'https://sdk.cashfree.com/js/v3/cashfree.js', async: true
    }));
    
    const allCountries = countryList().getData();
    setCountries(allCountries);
    
    // Auto-detect user timezone and location
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setForm(prev => ({ ...prev, timeZone: userTimeZone }));
    
    fetch('https://ipapi.co/json')
      .then(res => res.json())
      .then(data => {
        if (data?.country_name && data?.city) {
          const countryObj = allCountries.find(c => c.label === data.country_name);
          setForm(prev => ({ ...prev, country: countryObj?.label || '', city: data.city }));
        }
      });
  }, []);

  // Fetch Cities when Country changes
  useEffect(() => {
    if (form.country) {
      fetch(`https://countriesnow.space/api/v0.1/countries/cities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: form.country })
      })
        .then(res => res.json())
        .then(data => setCities(data.data || []))
        .catch(() => setCities([])); // Fallback if API fails
    }
  }, [form.country]);

  // Fetch Booked Slots
  useEffect(() => {
    if (form.preferredDate && form.doctor) {
      fetch(`/api/booked-slots?doctor=${form.doctor}&date=${form.preferredDate}`)
        .then(res => res.json())
        .then(data => setBookedSlots(data.booked || []))
        .catch(() => setBookedSlots([]));
    }
  }, [form.preferredDate, form.doctor]);

  const handleDoctorSelect = (doctor) => {
    setForm({ ...form, doctor: doctor.name, price: doctor.discountedPrice, originalPrice: doctor.price });
    setStep(2);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handlePhoneChange = (e) => {
    // International Phone Sanitization: Allow only numbers, +, spaces, and dashes for display
    const val = e.target.value.replace(/[^\d+\s-]/g, '');
    setForm({ ...form, phone: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.preferredTime) {
      alert("Please select a preferred time slot.");
      return;
    }
    setLoading(true);

    try {
      const [year, month, day] = form.preferredDate.split('-').map(Number);
      const [hour, minute] = form.preferredTime.split(':').map(Number);
      
      // Calculate times based on Luxon
      const localTime = DateTime.fromObject({ year, month, day, hour, minute }, { zone: form.timeZone });
      const indiaTime = localTime.setZone('Asia/Kolkata').toFormat('yyyy-LL-dd HH:mm');

      // Strict phone sanitization for Cashfree API (remove everything except numbers and +)
      const sanitizedPhone = form.phone.replace(/[^\d+]/g, '');

      const payload = {
        ...form,
        phone: sanitizedPhone,
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
        const cashfree = window.Cashfree({ mode: 'production' });
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: '_self',
          onSuccess: () => setIsSuccess(true),
          onFailure: (err) => {
            console.error('❌ Cashfree failure:', err);
            alert('Payment failed. Please try again.');
          },
        });
      } else {
        alert('Payment initiation failed: ' + (data.error || 'Unknown error.'));
      }
    } catch (err) {
      console.error('❌ Submit error:', err);
      alert('Something went wrong processing your booking.');
    } finally {
      setLoading(false);
    }
  };

  // Custom styling for React-Select to match Tailwind theme
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '2px',
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#3b82f6' : '#e5e7eb',
      backgroundColor: state.isFocused ? '#ffffff' : '#f9fafb',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      '&:hover': { borderColor: '#3b82f6' }
    })
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 text-green-900 p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-10 bg-white rounded-3xl shadow-xl border border-green-200 max-w-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-4xl text-green-600"></i>
          </div>
          <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your consultation with <strong>{form.doctor}</strong> is successfully scheduled. Check your email (<strong>{form.email}</strong>) for the video link and details.</p>
          <button onClick={() => window.location.href = '/'} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">Return to Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-blue-200">
      {/* Sticky Urgency Banner */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 text-center text-sm font-semibold tracking-wide shadow-md flex justify-center items-center gap-2">
        <i className="fas fa-bolt text-yellow-300"></i>
        <span>International Priority Offer: <strong className="text-yellow-300">50% OFF</strong> ends in</span>
        <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-white tracking-widest">{formatCountdown()}</span>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {step === 1 && (
          <section className="animate-fade-in">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a1e3f] mb-4 tracking-tight">Select Your Specialist</h1>
              <p className="text-gray-500 text-lg">Speak 1-on-1 with India's top Ayurvedic experts from the comfort of your home, anywhere in the world.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
              {doctors.map((doc, idx) => (
                <motion.div
                  key={doc.name}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="relative bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 p-8 transition-all group overflow-hidden"
                >
                  {/* Decorative Background Blob */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-all z-0"></div>

                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="relative">
                        <img src={doc.photo} alt={doc.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm whitespace-nowrap">
                          Available
                        </div>
                      </div>
                      
                      <div className="text-center sm:text-left">
                        <h3 className="text-2xl font-bold text-gray-900">{doc.name}</h3>
                        <p className="text-blue-600 font-semibold text-sm mt-1">{doc.degrees}</p>
                        <p className="text-gray-500 text-sm mt-2 line-clamp-2">{doc.desc}</p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                          {doc.expertise.map((item, i) => (
                            <span key={i} className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">{item}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <div className="text-gray-400 text-sm line-through decoration-red-400/50">USD ${doc.price}</div>
                        <div className="text-3xl font-extrabold text-gray-900">
                          ${doc.discountedPrice} <span className="text-sm font-normal text-gray-500">/ session</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDoctorSelect(doc)}
                        className="w-full sm:w-auto bg-[#0a1e3f] hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        Book Slot <i className="fas fa-arrow-right text-sm"></i>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <motion.div 
            ref={formRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto"
          >
            {/* Left Column: Form */}
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
                <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                  <i className="fas fa-chevron-left"></i> Change Doctor
                </button>
                <div className="text-sm text-gray-500"><i className="fas fa-lock text-green-600 mr-1"></i> Secure 256-bit Booking</div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-10">
                {/* SECTION 1: Personal Info */}
                <SectionHeader step="1" title="Patient Details" subtitle="Your information is kept strictly confidential." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                  <InputField label="Full Legal Name" placeholder="e.g. John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required icon={<i className="fas fa-user"></i>} />
                  <SelectField label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} options={['Male', 'Female', 'Other']} required />
                  
                  <InputField label="Email Address" type="email" placeholder="For video links & prescriptions" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required icon={<i className="fas fa-envelope"></i>} />
                  <InputField label="Phone (Include Country Code)" type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={handlePhoneChange} required icon={<i className="fas fa-phone"></i>} />

                  <div className="col-span-1 sm:col-span-2">
                    <label className="block mb-1.5 text-sm font-semibold text-gray-700">Country of Residence</label>
                    <Select
                      options={countries}
                      value={countries.find(c => c.label === form.country)}
                      onChange={(val) => setForm({ ...form, country: val.label, city: '' })} // Reset city on country change
                      styles={customSelectStyles}
                      placeholder="Search for your country..."
                    />
                  </div>
                  {form.country && (
                    <div className="col-span-1 sm:col-span-2">
                      <SelectField label="City / State" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} options={cities} required />
                    </div>
                  )}
                </div>

                {/* SECTION 2: Medical Context */}
                <SectionHeader step="2" title="Health Context" subtitle="Help the doctor prepare for your consultation." />
                <div className="grid grid-cols-1 gap-5 mb-10">
                  <SelectField label="Primary Health Concern" value={form.healthConcern} onChange={(e) => setForm({ ...form, healthConcern: e.target.value })} options={['IBS', 'Ulcerative Colitis', 'Crohn’s Disease', 'Autoimmune Disorders', 'Psoriasis / Skin Issues', 'Fatty Liver', 'Infertility', 'General Wellness', 'Other']} required />
                  <div className="relative">
                    <label className="block mb-1.5 text-sm font-semibold text-gray-700">Describe Your Symptoms (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Briefly describe what you're experiencing, duration, etc."
                      value={form.symptoms}
                      onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none text-sm"
                    />
                  </div>
                </div>

                {/* SECTION 3: Scheduling */}
                <SectionHeader step="3" title="Select Date & Time" subtitle={`Times are shown in standard Indian Time (IST). Your local timezone is detected as: ${form.timeZone.replace('_', ' ')}`} />
                <div className="mb-8">
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Consultation Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={form.preferredDate}
                      onChange={(e) => setForm({ ...form, preferredDate: e.target.value, preferredTime: '' })}
                      required
                      className="w-full sm:w-1/2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {form.preferredDate && (
                    <div className="animate-fade-in">
                      <label className="block mb-3 text-sm font-semibold text-gray-700 flex justify-between">
                        <span>Select Available Time (IST)</span>
                        <span className="text-xs font-normal bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Live availability</span>
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {availableSlots.map((time) => {
                          const isBooked = bookedSlots.includes(time);
                          const isSelected = form.preferredTime === time;
                          
                          // Format 24h to 12h for UI
                          const [h, m] = time.split(':');
                          const ampm = h >= 12 ? 'PM' : 'AM';
                          const displayH = h % 12 || 12;

                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setForm({ ...form, preferredTime: time })}
                              className={`
                                py-2.5 px-1 rounded-lg text-sm font-medium border transition-all duration-200
                                ${isBooked ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60' : 
                                  isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 
                                  'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'}
                              `}
                            >
                              {displayH}:{m} {ampm}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 lg:hidden block">
                  <button type="submit" disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-lg transition disabled:opacity-70 disabled:cursor-wait">
                    {loading ? 'Initiating Secure Payment...' : `Complete Booking ($${form.price} USD)`}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Sticky Order Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-16">
                
                {/* Summary Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-3">Booking Summary</h3>
                  
                  <div className="flex items-center gap-4 mb-5">
                    <img src={doctors.find(d => d.name === form.doctor)?.photo} alt="Doctor" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                    <div>
                      <div className="font-bold text-gray-800">{form.doctor}</div>
                      <div className="text-xs text-gray-500">Video Consultation</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-medium text-gray-900">{form.preferredDate ? new Date(form.preferredDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'}) : 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time (IST)</span>
                      <span className="font-medium text-gray-900">{form.preferredTime || 'Not selected'}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 pt-4 mb-6">
                    <div className="flex justify-between text-sm mb-2 text-gray-500">
                      <span>Standard Rate</span>
                      <span className="line-through">${form.originalPrice} USD</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="text-3xl font-extrabold text-green-600">${form.price} <span className="text-sm font-normal text-gray-500">USD</span></span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="w-full hidden lg:flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                  >
                    {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-lock"></i>}
                    {loading ? 'Processing...' : 'Pay & Confirm'}
                  </button>
                  <div className="text-center text-xs text-gray-400 mt-3">Payments secured by Cashfree PCI-DSS</div>
                </div>

                {/* Trust Indicators for International Patients */}
                <div className="bg-[#f8fafc] rounded-2xl border border-blue-100 p-5">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">What happens next?</h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <i className="fas fa-envelope-open-text text-blue-500 mt-0.5"></i>
                      <span>Instant confirmation email with your booking ID.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-video text-blue-500 mt-0.5"></i>
                      <span>Private Zoom/Meet link sent 24 hrs prior to call.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-file-medical text-blue-500 mt-0.5"></i>
                      <span>Personalized Ayurvedic plan emailed within 12 hours post-consult.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fab fa-whatsapp text-green-500 mt-0.5"></i>
                      <span>7 days of free follow-up chat support via WhatsApp.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </main>
    </div>
  );
}
