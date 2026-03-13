import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Users, LogOut, Shield, Briefcase, Activity, X, UserPlus, AlertCircle, CheckCircle2, Trash2, Search, Pill, Plus } from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0 });
    const [usersList, setUsersList] = useState([]);
    const [departmentsList, setDepartmentsList] = useState([]);
    const [medicationsList, setMedicationsList] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(true);

    // Toast
    const [toast, setToast] = useState(null);
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Add User Modal
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Department Modal
    const [showAddDeptModal, setShowAddDeptModal] = useState(false);
    const [newDept, setNewDept] = useState({ name: '', description: '' });

    // Add Medication Modal
    const [showAddMedModal, setShowAddMedModal] = useState(false);
    const [newMed, setNewMed] = useState({ name: '', manufacturer: '', price: 0, stockQuantity: 0 });

    // Search users
    const [searchQuery, setSearchQuery] = useState('');

    const handleAddUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/admin/users', newUser);
            showToast('User created successfully!');
            setShowAddUserModal(false);
            setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR' });
            const res = await api.get('/admin/users').catch(() => ({ data: [] }));
            setUsersList(res.data);
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data || 'Failed to create user', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            showToast('User deleted successfully!');
            setUsersList(usersList.filter(u => u.id !== id));
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data || 'Failed to delete user', 'error');
        }
    };

    const handleUpdateRole = async (id, newRole) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role: newRole });
            showToast('User role updated successfully!');
            setUsersList(usersList.map(u => u.id === id ? { ...u, role: newRole } : u));
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data || 'Failed to update user role', 'error');
        }
    };

    const handleCreateDept = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/admin/departments', newDept);
            showToast('Department created successfully!');
            setShowAddDeptModal(false);
            setNewDept({ name: '', description: '' });
            const res = await api.get('/admin/departments').catch(() => ({ data: [] }));
            setDepartmentsList(res.data);
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data || 'Failed to create department', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateMed = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/admin/medications', newMed);
            showToast('Medication added successfully!');
            setShowAddMedModal(false);
            setNewMed({ name: '', manufacturer: '', price: '', stockQuantity: '' });
            const res = await api.get('/admin/medications').catch(() => ({ data: [] }));
            setMedicationsList(res.data);
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data || 'Failed to add medication', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMed = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medication?')) return;
        try {
            await api.delete(`/admin/medications/${id}`);
            showToast('Medication deleted successfully!');
            setMedicationsList(medicationsList.filter(m => m.id !== id));
        } catch (err) {
            showToast(err.response?.data?.message || err.response?.data || 'Failed to delete medication', 'error');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/admin/users').catch(() => ({ data: [] }));
                setUsersList(res.data);

                const docs = await api.get('/doctors').catch(() => ({ data: [] }));
                const depts = await api.get('/admin/departments').catch(() => ({ data: [] }));
                const meds = await api.get('/admin/medications').catch(() => ({ data: [] }));

                setDepartmentsList(depts.data);
                setMedicationsList(meds.data);
                setStats({
                    doctors: docs.data.length,
                    patients: res.data.filter?.(u => u.role === 'PATIENT')?.length || 0,
                    appointments: 0,
                });
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = usersList.filter?.(u =>
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-50 text-red-700 border-red-200';
            case 'DOCTOR': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'RECEPTIONIST': return 'bg-orange-50 text-orange-700 border-orange-200';
            default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        }
    };

    const tabs = [
        { id: 'overview', label: 'System Overview', icon: Activity },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'departments', label: 'Departments', icon: Briefcase },
        { id: 'pharmacy', label: 'Pharmacy', icon: Pill },
    ];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full border-4 border-indigo-400/30 border-t-indigo-400 animate-spin-slow mx-auto"></div>
                    <p className="mt-4 text-gray-400 font-medium">Loading admin panel...</p>
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
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="flex-1 py-8 px-4 space-y-1">
                    <div className="mb-8 px-4 flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold">HMS Admin</span>
                    </div>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-indigo-600 text-white font-semibold shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                            <tab.icon className="h-5 w-5 mr-3" /> {tab.label}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-800">
                    <div className="px-4 py-2 mb-2 text-xs text-gray-500 font-medium truncate">{user?.email}</div>
                    <button onClick={logout} className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-800 rounded-xl transition-colors">
                        <LogOut className="h-5 w-5 mr-3" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-6xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {activeTab === 'overview' && 'Monitor system health and key metrics'}
                            {activeTab === 'users' && 'Manage system users and roles'}
                            {activeTab === 'departments' && 'Manage hospital departments'}
                            {activeTab === 'pharmacy' && 'Manage medication inventory'}
                        </p>
                    </header>

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Total Doctors', value: stats.doctors, gradient: 'from-indigo-500 to-blue-600', icon: '👨‍⚕️' },
                                    { label: 'Total Patients', value: stats.patients, gradient: 'from-emerald-500 to-green-600', icon: '🧑‍🤝‍🧑' },
                                    { label: 'System Users', value: usersList.length, gradient: 'from-purple-500 to-fuchsia-600', icon: '👥' },
                                ].map((stat, i) => (
                                    <div key={i} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up`}
                                        style={{ animationFillMode: 'both', animationDelay: `${i * 100}ms` }}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                                                <p className="text-4xl font-bold mt-2">{stat.value}</p>
                                            </div>
                                            <span className="text-4xl">{stat.icon}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-base font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">System Status</h3>
                                <div className="space-y-3">
                                    {[
                                        { status: 'green', text: 'Backend API — Healthy' },
                                        { status: 'green', text: 'Database Connection — Active' },
                                        { status: 'green', text: 'JWT Authentication — Active' },
                                        { status: 'blue', text: `Registered Users — ${usersList.length}` },
                                        { status: 'blue', text: `Registered Doctors — ${stats.doctors}` },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                            {item.text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── USERS ── */}
                    {activeTab === 'users' && (
                        <div className="animate-fade-in">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div className="relative w-full sm:w-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-72 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm" />
                                </div>
                                <button onClick={() => setShowAddUserModal(true)}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Add New User
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">ID</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Email</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Role</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredUsers.length > 0 ? filteredUsers.map((u, index) => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors animate-slide-up"
                                                    style={{ animationFillMode: 'both', animationDelay: `${index * 30}ms` }}>
                                                    <td className="px-6 py-4 font-medium text-gray-400">#{u.id}</td>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">{u.firstName} {u.lastName}</td>
                                                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <select value={u.role} onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                            className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${getRoleBadge(u.role)}`}>
                                                            <option value="ADMIN">ADMIN</option>
                                                            <option value="DOCTOR">DOCTOR</option>
                                                            <option value="RECEPTIONIST">RECEPTIONIST</option>
                                                            <option value="PATIENT">PATIENT</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => handleDeleteUser(u.id)}
                                                            title="Delete User"
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-16 text-center text-gray-400">
                                                        <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                                        {searchQuery ? 'No users match your search' : 'No user data accessible. The admin endpoint may need to be configured.'}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── DEPARTMENTS ── */}
                    {activeTab === 'departments' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-end mb-6">
                                <button onClick={() => setShowAddDeptModal(true)}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Add Department
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">ID</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {departmentsList.length > 0 ? departmentsList.map((dept, index) => (
                                                <tr key={dept.id} className="hover:bg-gray-50 transition-colors animate-slide-up"
                                                    style={{ animationFillMode: 'both', animationDelay: `${index * 30}ms` }}>
                                                    <td className="px-6 py-4 font-medium text-gray-400">#{dept.id}</td>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">{dept.name}</td>
                                                    <td className="px-6 py-4 text-gray-600">{dept.description}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-16 text-center text-gray-400">
                                                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                                        No departments found. Create one to get started.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PHARMACY ── */}
                    {activeTab === 'pharmacy' && (
                        <div className="animate-fade-in">
                            <div className="flex justify-end mb-6">
                                <button onClick={() => setShowAddMedModal(true)}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add Medication
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Manufacturer</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Price</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">In Stock</th>
                                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {medicationsList.length > 0 ? medicationsList.map((med, index) => (
                                                <tr key={med.id} className="hover:bg-gray-50 transition-colors animate-slide-up"
                                                    style={{ animationFillMode: 'both', animationDelay: `${index * 30}ms` }}>
                                                    <td className="px-6 py-4 font-semibold text-gray-900">{med.name}</td>
                                                    <td className="px-6 py-4 text-gray-600">{med.manufacturer}</td>
                                                    <td className="px-6 py-4 font-medium text-emerald-600">₹{med.price.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${med.stockQuantity <= 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                            {med.stockQuantity} units
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => handleDeleteMed(med.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                                                        <Pill className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                                        No medications in inventory.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Add User Modal */}
                {showAddUserModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Add New User</h2>
                                    <p className="text-sm text-gray-500">Create a new system account</p>
                                </div>
                                <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleAddUser} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                                        <input type="text" required value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                                        <input type="text" required value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                    <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all cursor-pointer">
                                        <option value="DOCTOR">Doctor</option>
                                        <option value="RECEPTIONIST">Receptionist</option>
                                        <option value="PATIENT">Patient</option>
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setShowAddUserModal(false)}
                                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" /> {isSubmitting ? 'Creating...' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Add Department Modal */}
                {showAddDeptModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Add New Department</h2>
                                    <p className="text-sm text-gray-500">Create a hospital department</p>
                                </div>
                                <button onClick={() => setShowAddDeptModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateDept} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department Name</label>
                                    <input type="text" required value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea rows="3" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none"></textarea>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setShowAddDeptModal(false)}
                                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" /> {isSubmitting ? 'Creating...' : 'Create Department'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Add Medication Modal */}
                {showAddMedModal && (
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Add Medication</h2>
                                    <p className="text-sm text-gray-500">Add to pharmacy inventory</p>
                                </div>
                                <button onClick={() => setShowAddMedModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateMed} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medication Name</label>
                                    <input type="text" required value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Manufacturer</label>
                                    <input type="text" required value={newMed.manufacturer} onChange={e => setNewMed({ ...newMed, manufacturer: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                                        <input type="number" step="0.01" required value={newMed.price} onChange={e => setNewMed({ ...newMed, price: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Stock</label>
                                        <input type="number" required value={newMed.stockQuantity} onChange={e => setNewMed({ ...newMed, stockQuantity: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all" />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setShowAddMedModal(false)}
                                        className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-medium text-sm transition-all">Cancel</button>
                                    <button type="submit" disabled={isSubmitting}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> {isSubmitting ? 'Adding...' : 'Add to Inventory'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
