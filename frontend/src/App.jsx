import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const AUDITORIUM_DATA = {
  "Metro Grand 1": { rent: 30000, acRate: 2000 },
  "Metro Grand 2": { rent: 60000, acRate: 3000 },
  "Metro Grand 2 (Dining Area Only)": { rent: 20000, acRate: 1500 },
  "Parking Area": { rent: 15000, acRate: 0 },
  "Metro Grand 3": { rent: 40000, acRate: 2500 }
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function App() {
  const [activeTab, setActiveTab] = useState('calendar');
  const [theme, setTheme] = useState('dark');
  const [bookings, setBookings] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [formData, setFormData] = useState({
    auditorium: "Metro Grand 1",
    bookingDate: '',
    startTime: '09:00',
    endTime: '15:00',
    clientName: '',
    clientAddress: '',
    contactNumber: '',
    baseRent: 30000,
    rentDiscount: 0,
    includeAC: true,
    acCharge: 2000,
    status: 'confirmed'
  });

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleAuditoriumChange = (e) => {
    const selectedAud = e.target.value;
    const audInfo = AUDITORIUM_DATA[selectedAud] || AUDITORIUM_DATA["Metro Grand 1"];
    setFormData({
      ...formData,
      auditorium: selectedAud,
      baseRent: audInfo.rent,
      acCharge: audInfo.acRate
    });
  };

  const finalRent = Math.max(0, Number(formData.baseRent) - Number(formData.rentDiscount));
  const totalPayable = finalRent + (formData.includeAC ? Number(formData.acCharge) : 0);

  const handleSaveBooking = async (e) => {
    e.preventDefault();

    const formattedNotes = `Name: ${formData.clientName} | Address: ${formData.clientAddress} | Phone: ${formData.contactNumber} | Base Rent: ₹${formData.baseRent} | Discount: ₹${formData.rentDiscount} | Net Rent: ₹${finalRent} | AC Charges: ₹${formData.includeAC ? formData.acCharge : 0} | Total Amount: ₹${totalPayable}`;

    const payload = {
      auditorium: formData.auditorium,
      booking_date: formData.bookingDate,
      time: `${formData.startTime} to ${formData.endTime}`,
      notes: formattedNotes,
      status: formData.status
    };

    try {
      await axios.post(`${API_BASE_URL}/bookings`, payload);
      alert("Booking Saved Successfully!");
      setActiveTab('calendar');
      fetchBookings();
    } catch (err) {
      alert("Failed to save booking. Please check server connection.");
    }
  };

  const handleDateClick = (day) => {
    const month = String(selectedMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${selectedYear}-${month}-${formattedDay}`;
    
    const currentAudInfo = AUDITORIUM_DATA[formData.auditorium];

    setFormData({
      auditorium: formData.auditorium,
      bookingDate: dateStr,
      startTime: '09:00',
      endTime: '15:00',
      clientName: '',
      clientAddress: '',
      contactNumber: '',
      baseRent: currentAudInfo.rent,
      rentDiscount: 0,
      includeAC: true,
      acCharge: currentAudInfo.acRate,
      status: 'confirmed'
    });
    setActiveTab('booking_form');
  };

  const getStatusForDate = (day) => {
    const month = String(selectedMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${selectedYear}-${month}-${formattedDay}`;

    const match = bookings.find(b => (b.booking_date || b.date) === dateStr);
    return match ? match.status : null;
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
  const yearOptions = Array.from({ length: 7 }, (_, i) => 2024 + i);

  const isDark = theme === 'dark';
  const themeStyles = {
    bg: isDark ? '#0f172a' : '#f1f5f9',
    text: isDark ? '#f8fafc' : '#0f172a',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e2e8f0',
    inputBg: isDark ? '#0f172a' : '#ffffff',
    inputText: isDark ? '#ffffff' : '#0f172a',
    subText: isDark ? '#94a3b8' : '#64748b',
    sectionBg: isDark ? '#1a2234' : '#f8fafc',
  };

  return (
    <div style={{ backgroundColor: themeStyles.bg, color: themeStyles.text, minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", paddingBottom: '70px' }}>
      
      {/* Top Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: themeStyles.cardBg, borderBottom: `1px solid ${themeStyles.border}` }}>
        <h3 style={{ margin: 0, color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>METRO GRAND</h3>
        <button onClick={toggleTheme} style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.text, fontSize: '12px', fontWeight: 'bold' }}>
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      {/* 1. CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <main style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: themeStyles.cardBg, color: themeStyles.inputText, border: `1px solid ${themeStyles.border}`, fontWeight: 'bold' }}>
              {MONTHS.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: themeStyles.cardBg, color: themeStyles.inputText, border: `1px solid ${themeStyles.border}`, fontWeight: 'bold' }}>
              {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontWeight: 'bold', color: themeStyles.subText, fontSize: '13px', padding: '4px' }}>{d}</div>
            ))}
            {Array(firstDayIndex).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const status = getStatusForDate(day);
              return (
                <div key={day} onClick={() => handleDateClick(day)} style={{
                  aspectRatio: '1', borderRadius: '10px', padding: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  backgroundColor: status === 'confirmed' ? '#059669' : status === 'enquiry' ? '#d97706' : themeStyles.cardBg,
                  border: `1px solid ${themeStyles.border}`,
                  color: status ? '#fff' : themeStyles.text
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{day}</span>
                  {status && <span style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '2px' }}>●</span>}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', fontSize: '12px', color: themeStyles.subText }}>
            <span>🟢 Confirmed</span>
            <span>🟠 Enquiry</span>
          </div>
        </main>
      )}

      {/* 2. FULL SCREEN BOOKING FORM */}
      {activeTab === 'booking_form' && (
        <main style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '16px', padding: '16px', border: `1px solid ${themeStyles.border}` }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#10b981' }}>New Booking</h3>
              <button onClick={() => setActiveTab('calendar')} style={{ backgroundColor: themeStyles.subText, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>Cancel</button>
            </div>

            <form onSubmit={handleSaveBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Select Facility</label>
                <select value={formData.auditorium} onChange={handleAuditoriumChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }}>
                  {Object.keys(AUDITORIUM_DATA).map(aud => <option key={aud} value={aud}>{aud}</option>)}
                </select>
              </div>

              <div style={{ backgroundColor: themeStyles.sectionBg, padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>Client Details</span>
                <input type="text" placeholder="Full Name *" value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} required />
                <textarea placeholder="Address" value={formData.clientAddress} onChange={e => setFormData({...formData, clientAddress: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} rows="2" />
                <input type="tel" placeholder="Contact Number *" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} required />
              </div>

              <div style={{ backgroundColor: themeStyles.sectionBg, padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>Date & Time</span>
                <input type="date" value={formData.bookingDate} onChange={e => setFormData({...formData, bookingDate: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} required />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} required />
                  <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} required />
                </div>
              </div>

              <div style={{ backgroundColor: themeStyles.sectionBg, padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>Payment</span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px' }}>Base Rent (₹):</label>
                  <input type="number" value={formData.baseRent} onChange={e => setFormData({...formData, baseRent: Number(e.target.value)})} style={{ width: '110px', padding: '6px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '13px' }}>Discount (₹):</label>
                  <input type="number" value={formData.rentDiscount} onChange={e => setFormData({...formData, rentDiscount: Number(e.target.value)})} style={{ width: '110px', padding: '6px', borderRadius: '6px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} />
                </div>

                <div style={{ backgroundColor: isDark ? '#143823' : '#e8f5e9', padding: '10px', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                    <input type="checkbox" checked={formData.includeAC} onChange={e => setFormData({...formData, includeAC: e.target.checked})} />
                    Include AC Charge (Auto: ₹{formData.acCharge})
                  </label>
                  {formData.includeAC && (
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Edit AC Charge:</span>
                      <input type="number" value={formData.acCharge} onChange={e => setFormData({...formData, acCharge: Number(e.target.value)})} style={{ width: '100px', padding: '4px', borderRadius: '4px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }} />
                    </div>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: '#10b981', color: '#fff', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Total Payable:</span>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹{totalPayable}</span>
              </div>

              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${themeStyles.border}`, backgroundColor: themeStyles.inputBg, color: themeStyles.inputText }}>
                <option value="confirmed">Confirm Reservation</option>
                <option value="enquiry">Save as Enquiry</option>
              </select>

              <button type="submit" style={{ padding: '14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', marginTop: '6px' }}>
                Save Booking
              </button>

            </form>
          </div>
        </main>
      )}

      {/* 3. BOOKINGS LIST */}
      {activeTab === 'events' && (
        <main style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#10b981' }}>Booked Events</h3>
          {bookings.map(b => (
            <div key={b.id || b._id} style={{ padding: '14px', marginBottom: '10px', backgroundColor: themeStyles.cardBg, borderRadius: '10px', borderLeft: `5px solid ${b.status === 'confirmed' ? '#10b981' : '#f59e0b'}` }}>
              <h4 style={{ margin: '0 0 4px 0' }}>{b.auditorium}</h4>
              <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Date:</strong> {b.booking_date || b.date} ({b.time})</p>
              <p style={{ margin: '6px 0 0 0', opacity: 0.8, fontSize: '12px' }}>{b.notes}</p>
            </div>
          ))}
        </main>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '60px', backgroundColor: themeStyles.cardBg, borderTop: `1px solid ${themeStyles.border}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        <button onClick={() => setActiveTab('calendar')} style={{ background: 'none', border: 'none', color: activeTab === 'calendar' ? '#10b981' : themeStyles.subText, fontWeight: 'bold', fontSize: '13px' }}>
          📅 Calendar
        </button>
        <button onClick={() => setActiveTab('events')} style={{ background: 'none', border: 'none', color: activeTab === 'events' ? '#10b981' : themeStyles.subText, fontWeight: 'bold', fontSize: '13px' }}>
          📋 Bookings
        </button>
      </nav>

    </div>
  );
}

export default App;