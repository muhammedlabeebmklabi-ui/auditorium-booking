import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [auditorium, setAuditorium] = useState('Metro Grand 1');
  const [date, setDate] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Staff Management State
  const [staffList, setStaffList] = useState(['Staff 1', 'Staff 2', 'Manager']);
  const [newStaffName, setNewStaffName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [altMobileNumber, setAltMobileNumber] = useState('');

  // Event Details
  const [guestCount, setGuestCount] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('15:00');

  // Payment Calculation
  const [hallRent, setHallRent] = useState(30000);
  const [acHours, setAcHours] = useState(0);
  const [acCharge, setAcCharge] = useState(0);
  const [cleaningCharge, setCleaningCharge] = useState(3000);
  const [securityCount, setSecurityCount] = useState(0);
  const [securityCharge, setSecurityCharge] = useState(0);
  const [advanceReceived, setAdvanceReceived] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);

  // Remarks & Status
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('confirmed');

  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [message, setMessage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const auditoriumList = [
    'Metro Grand 1',
    'Metro Grand 2',
    'Metro Grand 3',
    'Metro Grand 2 - Dining Area Only',
    'Dormitory Hall'
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const yearList = Array.from({ length: 12 }, (_, i) => 2024 + i);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (newStaffName.trim() && !staffList.includes(newStaffName.trim())) {
      setStaffList([...staffList, newStaffName.trim()]);
      setNewStaffName('');
    }
  };

  const handleDeleteStaff = (nameToDelete) => {
    if (staffList.length <= 1) {
      alert('At least one staff member is required!');
      return;
    }
    setStaffList(staffList.filter((staff) => staff !== nameToDelete));
  };

  useEffect(() => {
    if (auditorium === 'Metro Grand 1') setHallRent(30000);
    else if (auditorium === 'Metro Grand 2') setHallRent(60000);
    else setHallRent(0);

    if (auditorium !== 'Metro Grand 2' && auditorium !== 'Metro Grand 3') {
      setSecurityCount(0);
    }
  }, [auditorium]);

  useEffect(() => {
    setAcCharge(Number(acHours) * 3000);
  }, [acHours]);

  useEffect(() => {
    setSecurityCharge(securityCount * 1200);
  }, [securityCount]);

  useEffect(() => {
    const total = Number(hallRent) + Number(acCharge) + Number(cleaningCharge) + Number(securityCharge);
    setTotalAmount(total);
    setBalanceAmount(total - Number(advanceReceived));
  }, [hallRent, acCharge, cleaningCharge, securityCharge, advanceReceived]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    try {
      const timeSlotStr = `${startTime} to ${endTime}`;
      const customerInfoStr = `Staff: ${selectedStaff || staffList[0]} | Customer: ${customerName} | Phone: ${mobileNumber} ${altMobileNumber ? `(Alt: ${altMobileNumber})` : ''} | Address: ${address}`;
      const amountDetailsStr = `Total: ₹${totalAmount} | Advance Recd: ₹${advanceReceived} | Balance: ₹${balanceAmount} (Rent: ₹${hallRent}, AC: ₹${acCharge} [${acHours} hrs], Clean: ₹${cleaningCharge}, Security: ₹${securityCharge})`;
      const fullNotes = `${customerInfoStr} | Guests: ${guestCount || 'N/A'} | Time: ${timeSlotStr} | ${amountDetailsStr} | Remarks: ${remarks || 'None'}`;

      const payload = {
        auditorium,
        date,
        time: timeSlotStr,
        notes: fullNotes,
        status
      };

      if (selectedBookingId) {
        await axios.delete(`http://127.0.0.1:8000/bookings/${selectedBookingId}`);
        await axios.post('http://127.0.0.1:8000/bookings', payload);
        setMessage('Booking updated successfully!');
      } else {
        await axios.post('http://127.0.0.1:8000/bookings', payload);
        setMessage('Booking saved successfully!');
      }

      setShowBookingModal(false);
      resetForm();
      fetchBookings();
    } catch (error) {
      console.error(error);
      setMessage('Failed to save/update booking!');
    }
  };

  const handleDeleteBooking = async (id, e) => {
    if (e) e.stopPropagation();
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this booking/enquiry?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/bookings/${id}`);
        setMessage('Booking deleted successfully!');
        setShowBookingModal(false);
        resetForm();
        fetchBookings();
      } catch (error) {
        setMessage('Failed to delete booking!');
      }
    }
  };

  const resetForm = () => {
    setSelectedBookingId(null);
    setAuditorium('Metro Grand 1');
    setSelectedStaff(staffList[0] || '');
    setCustomerName('');
    setAddress('');
    setMobileNumber('');
    setAltMobileNumber('');
    setGuestCount('');
    setStartTime('09:00');
    setEndTime('15:00');
    setHallRent(30000);
    setAcHours(0);
    setCleaningCharge(3000);
    setSecurityCount(0);
    setAdvanceReceived(0);
    setRemarks('');
    setStatus('confirmed');
  };

  const openBookingDetails = (booking) => {
    setSelectedBookingId(booking.id);
    setDate(booking.date);
    setAuditorium(booking.auditorium || 'Metro Grand 1');
    setStatus(booking.status || 'confirmed');
    setShowBookingModal(true);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

  const getBookingForDate = (dateStr) => bookings.find((b) => b.date === dateStr);

  const handleDateClick = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setDate(formattedDate);
    const existing = getBookingForDate(formattedDate);
    
    if (existing) {
      openBookingDetails(existing);
    } else {
      resetForm();
      setShowBookingModal(true);
    }
  };

  const handleMonthChange = (e) => {
    setCurrentDate(new Date(year, Number(e.target.value), 1));
  };

  const handleYearChange = (e) => {
    setCurrentDate(new Date(Number(e.target.value), month, 1));
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings
    .filter((b) => b.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#121212', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '650px', margin: 'auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '20px', background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <h1 style={{ margin: 0, color: '#4da6ff', fontSize: '26px' }}>PVR METRO VILLAGE</h1>
          <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '14px' }}>Auditorium Booking Management System</p>
        </div>

        {/* STAFF MANAGEMENT PANEL */}
        <div style={{ background: '#1e1e1e', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #333' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>👥 Authorized Staff Members</h4>
          <form onSubmit={handleAddStaff} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input 
              type="text" 
              placeholder="Enter Staff Name" 
              value={newStaffName} 
              onChange={(e) => setNewStaffName(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}
            />
            <button type="submit" style={{ background: '#28a745', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Add Staff
            </button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {staffList.map((staff, idx) => (
              <span key={idx} style={{ background: '#2a2a2a', border: '1px solid #4da6ff', padding: '5px 10px', borderRadius: '15px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                👤 {staff}
                <button onClick={() => handleDeleteStaff(staff)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* CALENDAR WITH MONTH & YEAR SELECTOR */}
        <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>&lt; Prev</button>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={month} onChange={handleMonthChange} style={{ padding: '8px', borderRadius: '5px', background: '#2a2a2a', color: '#4da6ff', border: '1px solid #4da6ff', fontWeight: 'bold' }}>
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>

              <select value={year} onChange={handleYearChange} style={{ padding: '8px', borderRadius: '5px', background: '#2a2a2a', color: '#4da6ff', border: '1px solid #4da6ff', fontWeight: 'bold' }}>
                {yearList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} style={{ background: '#333', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer' }}>Next &gt;</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', fontWeight: 'bold', marginBottom: '10px', color: '#888' }}>
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {daysArray.map((day, idx) => {
              if (!day) return <div key={idx} style={{ height: '55px' }}></div>;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const booking = getBookingForDate(dateStr);
              let bgColor = '#2a2a2a';
              let textColor = '#fff';

              if (booking) {
                if (booking.status === 'confirmed') bgColor = '#28a745';
                else if (booking.status === 'enquiry') { bgColor = '#ffc107'; textColor = '#000'; }
              }

              return (
                <div key={idx} onClick={() => handleDateClick(day)} style={{ height: '55px', backgroundColor: bgColor, color: textColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', border: '1px solid #333', padding: '2px' }}>
                  <strong style={{ fontSize: '15px' }}>{day}</strong>
                  {booking && <span style={{ fontSize: '9px', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '100%' }}>{booking.auditorium.replace('Metro Grand ', 'MG ')}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* CLICKABLE UPCOMING FUNCTIONS */}
        <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #333' }}>
          <h3 style={{ marginTop: 0, color: '#4da6ff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>📅 Upcoming Functions (Click to view/edit)</h3>
          {upcomingBookings.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No upcoming functions.</p>
          ) : (
            upcomingBookings.map((item, index) => (
              <div 
                key={index} 
                onClick={() => openBookingDetails(item)}
                style={{ background: '#2a2a2a', padding: '12px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #444' }}
              >
                <div>
                  <strong style={{ color: '#ffc107', display: 'block' }}>{item.date} ({item.time})</strong>
                  <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{item.auditorium}</span>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>{item.notes}</div>
                </div>
                <button onClick={(e) => handleDeleteBooking(item.id, e)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Delete</button>
              </div>
            ))
          )}
        </div>

        {/* FULL-SCREEN BOOKING INTERFACE */}
        {showBookingModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#121212', zIndex: 2000, overflowY: 'auto', padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '700px', margin: 'auto', background: '#1e1e1e', padding: '25px', borderRadius: '12px', border: '1px solid #4da6ff' }}>
              
              {/* MODAL HEADER WITH ONLY CLOSE BUTTON */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, color: '#4da6ff' }}>📌 Booking Form — Date: {date}</h2>
                <button onClick={() => setShowBookingModal(false)} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Close ✕</button>
              </div>

              <form onSubmit={handleBookingSubmit}>
                
                {/* 1. Auditorium Selection */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>1. Select Auditorium *</label>
                  <select value={auditorium} onChange={(e) => setAuditorium(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}>
                    {auditoriumList.map((item, index) => <option key={index} value={item}>{item}</option>)}
                  </select>
                </div>

                {/* 2. Customer Details Section */}
                <div style={{ background: '#262626', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #333' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#ffc107' }}>👤 Booking & Customer Details</h4>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px', color: '#4da6ff', fontWeight: 'bold' }}>Booking Staff Name *</label>
                    <select 
                      value={selectedStaff} 
                      onChange={(e) => setSelectedStaff(e.target.value)} 
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff' }}
                    >
                      {staffList.map((staff, idx) => (
                        <option key={idx} value={staff}>{staff}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Customer Name:</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full Customer Name" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Address:</label>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Customer Address" rows="2" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
                      <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="10-digit Mobile" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Alternate Mobile Number</label>
                      <input type="tel" value={altMobileNumber} onChange={(e) => setAltMobileNumber(e.target.value)} placeholder="Alternate Mobile" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                {/* 3. Event Details */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Guest Count & Time Duration</label>
                  <input type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} placeholder="Number of Guests" required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: '#fff', marginBottom: '10px', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>From:</span>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>To:</span>
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }} />
                    </div>
                  </div>
                </div>

                {/* 4. FINANCIAL SUMMARY SECTION */}
                <div style={{ background: '#262626', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #444' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>📊 Financial Summary</h4>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>Hall Rent (₹):</label>
                    <input type="number" value={hallRent} onChange={(e) => setHallRent(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>AC Usage (Hours @ ₹3000/hr):</label>
                    <input type="number" step="0.5" value={acHours} onChange={(e) => setAcHours(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>Cleaning Charge (₹):</label>
                    <input type="number" value={cleaningCharge} onChange={(e) => setCleaningCharge(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px' }}>Advance Received (₹):</label>
                    <input type="number" value={advanceReceived} onChange={(e) => setAdvanceReceived(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '10px', color: '#fff' }}>
                    <span>Grand Total: ₹{totalAmount}</span>
                    <span style={{ color: '#28a745' }}>Balance: ₹{balanceAmount}</span>
                  </div>
                </div>

                {/* Status & Remarks */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Booking Status:</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: '#fff' }}>
                    <option value="confirmed">Confirmed (Green 🟢)</option>
                    <option value="enquiry">Enquiry (Yellow 🟡)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Remarks:</label>
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Additional notes..." style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#2a2a2a', color: '#fff', boxSizing: 'border-box', height: '60px' }} />
                </div>

                {/* UPDATED ACTION BUTTONS AT BOTTOM */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, padding: '14px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
                    {selectedBookingId ? 'Update Booking' : 'Save Booking'}
                  </button>
                  
                  {selectedBookingId && (
                    <button type="button" onClick={(e) => handleDeleteBooking(selectedBookingId, e)} style={{ padding: '14px 20px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                      🗑️ Delete Booking
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        )}

        {message && <p style={{ marginTop: '20px', fontWeight: 'bold', textAlign: 'center', color: '#4da6ff' }}>{message}</p>}
      </div>
    </div>
  );
}

export default App;