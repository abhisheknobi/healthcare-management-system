import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Calendar, Search, CreditCard, LogOut, Clock, CalendarDays, Edit3, Save, X, AlertCircle, CheckCircle2, Heart } from 'lucide-react';
import { format, startOfTomorrow } from 'date-fns';

const PatientDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(true);

    // Toast notification state
    const [toast, setToast] = useState(null);

    // Profile Edit state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        bloodGroup: '', contactNumber: '', address: '', medicalHistory: '', allergies: ''
    });

    // Booking state
    const [selectedDate, setSelectedDate] = useState(format(startOfTomorrow(), 'yyyy-MM-dd'));
    const [selectedTime, setSelectedTime] = useState('10:00');
    const [bookingDoctor, setBookingDoctor] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const profileRes = await api.get('/patients/me').catch(() => ({ data: null }));
            setProfile(profileRes.data);
            if (profileRes.data) {
                setProfileForm({
                    bloodGroup: profileRes.data.bloodGroup || '',
                    contactNumber: profileRes.data.contactNumber || '',
                    address: profileRes.data.address || '',
                    medicalHistory: profileRes.data.medicalHistory || '',
                    allergies: profileRes.data.allergies || '',
                });
            }

            const doctorsRes = await api.get('/doctors');
            setDoctors(doctorsRes.data);

            const appointmentsRes = await api.get('/appointments/patient');
            setAppointments(appointmentsRes.data);

            const billsRes = await api.get('/bills/patient');
            setBills(billsRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/patients/me', profileForm);
            setProfile(res.data);
            setIsEditingProfile(false);
            showToast('Profile updated successfully!');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    const handleBookAppointment = async (doctorId) => {
        try {
            const appointmentTime = `${selectedDate}T${selectedTime}:00`;
            await api.post('/appointments', { doctorUserId: doctorId, appointmentTime });
            showToast('Appointment successfully booked!');
            const res = await api.get('/appointments/patient');
            setAppointments(res.data);
            setBookingDoctor(null);
            setActiveTab('appointments');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to book appointment', 'error');
        }
    };

    const handlePayBill = async (billId) => {
        try {
            await api.put(`/bills/${billId}/pay`);
            showToast('Bill paid successfully!');
            const res = await api.get('/bills/patient');
            setBills(res.data);
        } catch (err) {
            showToast('Failed to pay bill', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'doctors', label: 'Find a Doctor', icon: Search },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'bills', label: 'Billing', icon: CreditCard },
    ];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin-slow mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 animate-fade-in">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl animate-slide-down border ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                    {toast.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                    <span className="font-medium text-sm">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                <div className="flex-1 py-8 px-4 space-y-1">
                    <div className="mb-8 px-4 flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-800">Healthcare Hub</span>
                    </div>

                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <tab.icon className="h-5 w-5 mr-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t">
                    <div className="px-4 py-2 mb-2 text-xs text-gray-400 font-medium truncate">{user?.email}</div>
                    <button onClick={logout} className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut className="h-5 w-5 mr-3" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {activeTab === 'profile' && 'View and manage your personal information'}
                            {activeTab === 'doctors' && 'Browse doctors and book your next appointment'}
                            {activeTab === 'appointments' && 'Track all your booked appointments'}
                            {activeTab === 'bills' && 'View and pay your invoices'}
                        </p>
                    </header>

                    {/* ── PROFILE TAB ── */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            {profile ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                                                {profile.user?.firstName?.charAt(0)}{profile.user?.lastName?.charAt(0)}
                                            </div>
                                            <div className="text-white">
                                                <h2 className="text-xl font-bold">{profile.user?.firstName} {profile.user?.lastName}</h2>
                                                <p className="text-blue-100 text-sm">{profile.user?.email}</p>
                                            </div>
                                            {!isEditingProfile && (
                                                <button onClick={() => setIsEditingProfile(true)}
                                                    className="ml-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all backdrop-blur-sm">
                                                    <Edit3 className="w-4 h-4" /> Edit Profile
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isEditingProfile ? (
                                        <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                                                    <select value={profileForm.bloodGroup} onChange={e => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all">
                                                        <option value="">Select</option>
                                                        {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                                                    <input type="text" required value={profileForm.contactNumber} onChange={e => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                                        placeholder="+1-555-0198" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                                <input type="text" required value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                                    placeholder="123 Main St, Springfield" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History</label>
                                                <textarea rows="3" value={profileForm.medicalHistory} onChange={e => setProfileForm({ ...profileForm, medicalHistory: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all resize-none"
                                                    placeholder="Any relevant medical history..." />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies</label>
                                                <input type="text" value={profileForm.allergies} onChange={e => setProfileForm({ ...profileForm, allergies: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                                    placeholder="Peanuts, Penicillin" />
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4 border-t">
                                                <button type="button" onClick={() => setIsEditingProfile(false)}
                                                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all">
                                                    Cancel
                                                </button>
                                                <button type="submit"
                                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm transition-all shadow-sm flex items-center gap-2">
                                                    <Save className="w-4 h-4" /> Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-8">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Blood Group', value: profile.bloodGroup, icon: '🩸' },
                                                    { label: 'Contact', value: profile.contactNumber, icon: '📞' },
                                                    { label: 'Address', value: profile.address, icon: '📍' },
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                        <span className="text-lg">{item.icon}</span>
                                                        <p className="text-xs text-gray-500 font-medium mt-1">{item.label}</p>
                                                        <p className="font-semibold text-gray-900 mt-0.5">{item.value || 'Not set'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-medium">Medical History</p>
                                                    <p className="text-sm text-gray-800 mt-1">{profile.medicalHistory || 'Not set'}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-medium">Allergies</p>
                                                    <p className="text-sm text-gray-800 mt-1">{profile.allergies || 'Not set'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                    <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-2xl mb-4">
                                        <User className="h-8 w-8 text-blue-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Your Profile</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-6">Set up your patient profile to help doctors provide better care.</p>
                                    <button onClick={() => { setIsEditingProfile(true); setProfile({ user: {} }); }}
                                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm transition-all shadow-sm">
                                        Set Up Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── DOCTORS TAB ── */}
                    {activeTab === 'doctors' && (
                        <div className="animate-fade-in space-y-6">
                            {/* Date/Time Selector */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-end border border-blue-100">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                        <CalendarDays className="w-4 h-4" /> Preferred Date
                                    </label>
                                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all" />
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> Preferred Time
                                    </label>
                                    <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all cursor-pointer">
                                        <option value="09:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="13:00">01:00 PM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="16:00">04:00 PM</option>
                                        <option value="17:00">05:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            {/* Doctor Cards */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {doctors.map((doctor, index) => (
                                    <div key={doctor.id}
                                        className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full animate-slide-up"
                                        style={{ animationFillMode: 'both', animationDelay: `${index * 60}ms` }}>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                    {doctor.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Dr. {doctor.name}</h3>
                                                    <p className="text-sm text-blue-600 font-medium">{doctor.specialization || 'General'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mb-6">
                                                <p className="text-sm text-gray-600 flex items-start">
                                                    <span className="font-medium inline-block w-24 flex-shrink-0 text-gray-400">Qualification</span>
                                                    <span>{doctor.qualification || 'N/A'}</span>
                                                </p>
                                                <p className="text-sm text-gray-600 flex items-start">
                                                    <span className="font-medium inline-block w-24 flex-shrink-0 text-gray-400">Contact</span>
                                                    <span>{doctor.contactNumber || 'N/A'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleBookAppointment(doctor.userId)}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold text-sm transition-all mt-auto shadow-sm hover:shadow-md">
                                            Book Appointment
                                        </button>
                                    </div>
                                ))}
                                {doctors.length === 0 && (
                                    <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                                        <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-lg font-medium">No doctors available</p>
                                        <p className="text-gray-400 text-sm mt-1">Check back later for available doctors</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── APPOINTMENTS TAB ── */}
                    {activeTab === 'appointments' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Date & Time</th>
                                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Doctor</th>
                                            <th className="px-6 py-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map((apt, index) => (
                                            <tr key={apt.id}
                                                className="border-b border-gray-50 last:border-0 hover:bg-blue-50/50 transition-colors animate-slide-up"
                                                style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}>
                                                <td className="px-6 py-4 font-medium text-gray-400">#{apt.id}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{new Date(apt.appointmentTime).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-gray-700">Dr. {apt.doctorName}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(apt.status)}`}>
                                                        {apt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {appointments.length === 0 && (
                                            <tr><td colSpan="4" className="px-6 py-16 text-center text-gray-400">
                                                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                                No appointments found. Book one from the "Find a Doctor" tab.
                                            </td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── BILLS TAB ── */}
                    {activeTab === 'bills' && (
                        <div className="space-y-4 animate-fade-in">
                            {bills.map((bill, index) => (
                                <div key={bill.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 animate-slide-up"
                                    style={{ animationFillMode: 'both', animationDelay: `${index * 60}ms` }}>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Invoice #{bill.id}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Total: <span className="font-bold text-gray-900 text-lg">₹{bill.totalAmount?.toFixed(2)}</span>
                                        </p>
                                        {bill.createdAt && <p className="text-xs text-gray-400 mt-1">{new Date(bill.createdAt).toLocaleDateString()}</p>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 text-sm rounded-xl font-semibold border ${bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {bill.status}
                                        </span>
                                        {bill.status === 'UNPAID' && (
                                            <button onClick={() => handlePayBill(bill.id)}
                                                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-green-700 text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {bills.length === 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                    <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-gray-500 font-medium">No billing records found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
