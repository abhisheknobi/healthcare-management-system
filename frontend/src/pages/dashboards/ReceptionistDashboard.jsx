import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { LogOut, Receipt, Search, X, AlertCircle, CheckCircle2, IndianRupee, FileText, ClipboardCheck } from 'lucide-react';

const ReceptionistDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('billing');

    // Toast
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Appointment search
    const [searchId, setSearchId] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Bill form
    const [billData, setBillData] = useState({
        consultationFee: 150.00,
        laboratoryFee: 0.00,
        medicationFee: 0.00,
    });

    // Recent generated bills
    const [recentBills, setRecentBills] = useState([]);

    const handleChange = (e) => {
        setBillData({ ...billData, [e.target.name]: parseFloat(e.target.value) || 0 });
    };

    const handleSelectAppointment = async () => {
        if (searchId) {
            setSelectedAppointment(searchId);
            try {
                const res = await api.get(`/admin/appointments/${searchId}/bill-estimate`);
                setBillData(prev => ({ ...prev, medicationFee: res.data }));
                showToast(`Calculated medication fee for #${searchId}: ₹${res.data}`);
            } catch (err) {
                console.error("Failed to fetch bill estimate", err);
                setBillData(prev => ({ ...prev, medicationFee: 0.00 }));
            }
        }
    };

    const handleGenerateBill = async (e) => {
        e.preventDefault();
        if (!selectedAppointment) {
            showToast('Please select an appointment first', 'error');
            return;
        }
        try {
            const res = await api.post(`/bills/appointment/${selectedAppointment}`, billData);
            showToast(`Invoice generated for Appointment #${selectedAppointment}!`);
            setRecentBills(prev => [{ id: res.data.id, appointmentId: selectedAppointment, total: res.data.totalAmount, status: res.data.status }, ...prev]);
            setSearchId('');
            setSelectedAppointment(null);
            setBillData({ consultationFee: 150.00, laboratoryFee: 0.00, medicationFee: 0.00 });
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data || 'Failed to generate bill', 'error');
        }
    };

    const handlePayBill = async (billId) => {
        try {
            await api.put(`/bills/${billId}/pay`);
            showToast('Bill marked as PAID!');
            setRecentBills(prev => prev.map(b => b.id === billId ? { ...b, status: 'PAID' } : b));
        } catch (err) {
            showToast('Failed to mark bill as paid', 'error');
        }
    };

    const totalAmount = billData.consultationFee + billData.laboratoryFee + billData.medicationFee;

    const tabs = [
        { id: 'billing', label: 'Generate Invoice', icon: Receipt },
        { id: 'history', label: 'Recent Invoices', icon: FileText },
    ];

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
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <ClipboardCheck className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-800">Healthcare Hub</span>
                    </div>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-orange-50 text-orange-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
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

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Billing Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Generate and manage patient invoices</p>
                    </header>

                    {activeTab === 'billing' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                            {/* Left: Select Appointment */}
                            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                                <h2 className="text-base font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
                                    <Search className="w-5 h-5 text-orange-500" /> Find Appointment
                                </h2>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment ID</label>
                                    <div className="flex gap-2">
                                        <input type="number" value={searchId} onChange={(e) => setSearchId(e.target.value)}
                                            placeholder="e.g. 1"
                                            onKeyDown={e => e.key === 'Enter' && handleSelectAppointment()}
                                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all" />
                                        <button onClick={handleSelectAppointment} disabled={!searchId}
                                            className="px-4 py-3 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 font-semibold transition-colors disabled:opacity-40 border border-orange-200">
                                            Select
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-3 leading-relaxed">Enter the Appointment ID provided by the doctor or patient.</p>
                                </div>

                                {selectedAppointment && (
                                    <div className="mt-auto p-5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl animate-scale-in">
                                        <p className="text-sm text-orange-700 font-semibold">Selected Appointment</p>
                                        <p className="text-4xl font-bold text-orange-900 mt-1">#{selectedAppointment}</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Billing Form */}
                            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-base font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100 flex items-center justify-between">
                                    <span>Generate Invoice</span>
                                    {selectedAppointment && <span className="text-orange-600 text-sm font-semibold bg-orange-50 px-3 py-1 rounded-lg">Appointment #{selectedAppointment}</span>}
                                </h2>

                                <form onSubmit={handleGenerateBill} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { name: 'consultationFee', label: 'Consultation Fee', icon: '💊' },
                                            { name: 'laboratoryFee', label: 'Laboratory Fee', icon: '🔬' },
                                            { name: 'medicationFee', label: 'Medication Fee', icon: '💉' },
                                        ].map(field => (
                                            <div key={field.name}>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">{field.icon} {field.label}</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                                                    <input type="number" step="0.01" name={field.name}
                                                        value={billData[field.name]} onChange={handleChange}
                                                        className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <IndianRupee className="w-6 h-6 text-orange-500" />
                                            <div>
                                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Amount</p>
                                                <p className="text-3xl font-bold text-gray-900">₹{totalAmount.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <button type="submit"
                                            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-amber-700 font-semibold tracking-wide shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                                            <Receipt className="w-5 h-5" /> Generate Invoice
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="animate-fade-in">
                            {recentBills.length > 0 ? (
                                <div className="space-y-4">
                                    {recentBills.map((bill, index) => (
                                        <div key={bill.id}
                                            className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-all animate-slide-up"
                                            style={{ animationFillMode: 'both', animationDelay: `${index * 60}ms` }}>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">Invoice #{bill.id}</h3>
                                                <p className="text-sm text-gray-500 mt-1">Appointment #{bill.appointmentId}</p>
                                                <p className="text-sm text-gray-900 font-bold mt-1">₹{bill.total?.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 text-sm rounded-xl font-semibold border ${bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {bill.status}
                                                </span>
                                                {bill.status === 'UNPAID' && (
                                                    <button onClick={() => handlePayBill(bill.id)}
                                                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 text-sm font-semibold transition-all shadow-sm">
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-gray-500 font-medium">No invoices generated this session</p>
                                    <p className="text-gray-400 text-sm mt-1">Generate an invoice from the billing tab</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReceptionistDashboard;
