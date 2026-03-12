// Doctor Dashboard - Updated for medication quantities
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Calendar, ClipboardList, LogOut, CheckCircle, XCircle, Edit3, Save, X, AlertCircle, CheckCircle2, Stethoscope } from 'lucide-react';

const DoctorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [medicationsList, setMedicationsList] = useState([]);
    const [activeTab, setActiveTab] = useState('appointments');
    const [isLoading, setIsLoading] = useState(true);

    // Toast
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Profile Edit
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        specialization: '', qualification: '', contactNumber: ''
    });

    // Prescription Modal
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [prescribedItems, setPrescribedItems] = useState([]); // [{ medicationId, quantity, name, price }]

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/appointments/doctor');
            setAppointments(res.data);
        } catch (err) {
            console.error("Failed to fetch appointments", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const profileRes = await api.get('/doctors/me').catch(() => ({ data: null }));
                setProfile(profileRes.data);
                if (profileRes.data) {
                    setProfileForm({
                        specialization: profileRes.data.specialization || '',
                        qualification: profileRes.data.qualification || '',
                        contactNumber: profileRes.data.contactNumber || '',
                    });
                }
                const medsRes = await api.get('/admin/medications').catch(() => ({ data: [] }));
                setMedicationsList(medsRes.data);
                await fetchAppointments();
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/doctors/me', profileForm);
            setProfile({ ...profile, ...res.data });
            setIsEditingProfile(false);
            showToast('Profile updated successfully!');
            // Re-fetch to get the response DTO
            const profileRes = await api.get('/doctors/me').catch(() => ({ data: null }));
            if (profileRes.data) setProfile(profileRes.data);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/appointments/${id}/status?status=${newStatus}`);
            showToast(`Appointment ${newStatus.toLowerCase()} successfully!`);
            fetchAppointments();
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleAddPrescription = async (e) => {
        e.preventDefault();
        try {
            const medications = prescribedItems.map(item => ({
                medicationId: item.medicationId,
                quantity: parseInt(item.quantity)
            }));
            
            await api.post(`/appointments/${selectedAppointment.id}/prescriptions`, {
                diagnosis, 
                doctorNotes: notes, 
                medications: medications
            });
            showToast('Prescription added successfully!');
            setSelectedAppointment(null);
            setDiagnosis('');
            setNotes('');
            setPrescribedItems([]);
            fetchAppointments();
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to add prescription';
            showToast(errorMsg, 'error');
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
        { id: 'appointments', label: 'My Queue', icon: Calendar },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin-slow mx-auto"></div>
                    <p className="mt-4 text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 animate-fade-in">
            {/* Toast */}
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
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-800">Healthcare Hub</span>
                    </div>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <tab.icon className="h-5 w-5 mr-3" /> {tab.label}
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
                            {activeTab === 'profile' ? 'Doctor Profile' : 'Appointment Queue'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {activeTab === 'profile' ? 'View and update your professional information' : 'Manage your patient appointments'}
                        </p>
                    </header>

                    {/* ── PROFILE TAB ── */}
                    {activeTab === 'profile' && (
                        <div className="animate-fade-in">
                            {profile ? (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
                                                {profile.name?.charAt(0) || 'D'}
                                            </div>
                                            <div className="text-white">
                                                <h2 className="text-xl font-bold">Dr. {profile.name}</h2>
                                                <p className="text-indigo-100 text-sm">{profile.specialization || 'General Medicine'}</p>
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
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                                                    <input type="text" value={profileForm.specialization}
                                                        onChange={e => setProfileForm({ ...profileForm, specialization: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                                                        placeholder="e.g. Interventional Cardiology" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                                                    <input type="text" value={profileForm.qualification}
                                                        onChange={e => setProfileForm({ ...profileForm, qualification: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                                                        placeholder="e.g. MD, FACC" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                                                <input type="text" value={profileForm.contactNumber}
                                                    onChange={e => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                                                    placeholder="+1-555-8899" />
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4 border-t">
                                                <button type="button" onClick={() => setIsEditingProfile(false)}
                                                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all">Cancel</button>
                                                <button type="submit"
                                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm transition-all shadow-sm flex items-center gap-2">
                                                    <Save className="w-4 h-4" /> Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="p-8">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Specialization', value: profile.specialization, icon: '🩺' },
                                                    { label: 'Qualification', value: profile.qualification, icon: '🎓' },
                                                    { label: 'Contact', value: profile.contactNumber, icon: '📞' },
                                                ].map((item, i) => (
                                                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                        <span className="text-lg">{item.icon}</span>
                                                        <p className="text-xs text-gray-500 font-medium mt-1">{item.label}</p>
                                                        <p className="font-semibold text-gray-900 mt-0.5">{item.value || 'Not set'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                                    <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-2xl mb-4">
                                        <User className="h-8 w-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Your Profile</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto mb-6">Set up your doctor profile to start receiving appointments.</p>
                                    <button onClick={() => { setIsEditingProfile(true); setProfile({ name: '' }); }}
                                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 font-medium text-sm transition-all shadow-sm">
                                        Set Up Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── APPOINTMENTS TAB ── */}
                    {activeTab === 'appointments' && (
                        <div className="space-y-4 animate-fade-in">
                            {appointments.map((apt, index) => (
                                <div key={apt.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 animate-slide-up"
                                    style={{ animationFillMode: 'both', animationDelay: `${index * 60}ms` }}>
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                                            #{apt.id}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Patient: {apt.patientName}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{new Date(apt.appointmentTime).toLocaleString()}</p>
                                            <span className={`inline-flex mt-2 px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(apt.status)}`}>{apt.status}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {apt.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 text-sm font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200">
                                                    <CheckCircle className="w-4 h-4" /> Confirm
                                                </button>
                                                <button onClick={() => handleUpdateStatus(apt.id, 'CANCELLED')}
                                                    className="px-4 py-2 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 text-sm font-semibold flex items-center gap-1.5 transition-colors border border-red-200">
                                                    <XCircle className="w-4 h-4" /> Cancel
                                                </button>
                                            </>
                                        )}
                                        {apt.status === 'CONFIRMED' && (
                                            <button onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                                                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 text-sm font-semibold flex items-center gap-1.5 transition-colors border border-emerald-200">
                                                <CheckCircle className="w-4 h-4" /> Mark Completed
                                            </button>
                                        )}
                                        {apt.status === 'COMPLETED' && (
                                            <button onClick={() => setSelectedAppointment(apt)}
                                                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 text-sm font-semibold flex items-center gap-1.5 transition-colors border border-blue-200">
                                                <ClipboardList className="w-4 h-4" /> Add Prescription
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-gray-500 font-medium">No appointments in the queue</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Prescription Modal */}
                {selectedAppointment && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Add Prescription</h2>
                                    <p className="text-sm text-gray-500">For patient: {selectedAppointment.patientName}</p>
                                </div>
                                <button onClick={() => setSelectedAppointment(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddPrescription} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                                    <input type="text" required value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                                        placeholder="e.g. Viral Pharyngitis" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor's Notes</label>
                                    <textarea rows="3" required value={notes} onChange={e => setNotes(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none"
                                        placeholder="Patient should rest, drink plenty of fluids..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">Prescribed Medications</label>
                                    
                                    {/* Selection List */}
                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto p-1 border rounded-xl bg-gray-50/30">
                                        {medicationsList.map(med => {
                                            const isSelected = prescribedItems.some(item => item.medicationId === med.id);
                                            return (
                                                <div key={med.id} 
                                                     className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${isSelected ? 'border-indigo-500 bg-white shadow-sm' : 'border-transparent hover:border-indigo-200 hover:bg-white'}`}
                                                     onClick={() => {
                                                         if (isSelected) {
                                                             setPrescribedItems(prescribedItems.filter(item => item.medicationId !== med.id));
                                                         } else {
                                                             setPrescribedItems([...prescribedItems, { 
                                                                 medicationId: med.id, 
                                                                 quantity: 1, 
                                                                 name: med.name, 
                                                                 price: med.price,
                                                                 stock: med.stockQuantity
                                                             }]);
                                                         }
                                                     }}>
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white group-hover:border-indigo-400'}`}>
                                                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-gray-900">{med.name}</div>
                                                        <div className="text-xs text-gray-500">Stock: {med.stockQuantity} • ₹{med.price.toFixed(2)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {medicationsList.length === 0 && (
                                            <div className="text-center py-4 text-gray-400 text-sm italic">
                                                No medications available in inventory
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Items with Quantity Inputs */}
                                    {prescribedItems.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Set Quantities</p>
                                            {prescribedItems.map(item => (
                                                <div key={item.medicationId} className="flex items-center gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-[10px] text-indigo-600">₹{item.price.toFixed(2)} each</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase">Qty:</label>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            max={item.stock}
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                                                setPrescribedItems(prescribedItems.map(i => 
                                                                    i.medicationId === item.medicationId ? { ...i, quantity: val } : i
                                                                ));
                                                            }}
                                                            className="w-16 px-2 py-1 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-gray-400 italic font-medium px-1">Total Items: {prescribedItems.length}</p>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setSelectedAppointment(null)}
                                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all">Cancel</button>
                                    <button type="submit"
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm transition-all shadow-sm">Submit Prescription</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;
