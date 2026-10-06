import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { 
    User, Mail, ArrowRight, Shield, Save, CheckCircle2, 
    XCircle, Edit2, ShoppingBag, CreditCard, Activity, X
} from 'lucide-react';

export default function Profile() {
    const { user, login } = useContext(AuthContext);

    const [profile, setProfile] = useState({ name: '', email: '', role: '' });
    const [editProfile, setEditProfile] = useState({ name: '', email: '' });
    const [isEditingData, setIsEditingData] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

    const [summary, setSummary] = useState({
        total_orders: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        total_spent: 0
    });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [profileRes, summaryRes, ordersRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/orders/my-summary'),
                api.get('/orders/my-orders')
            ]);
            
            setProfile(profileRes.data);
            setEditProfile({ name: profileRes.data.name, email: profileRes.data.email });
            setSummary(summaryRes.data);
            setOrders(ordersRes.data);
        } catch (error) {
            console.error('Error loading profile data:', error);
            setProfileMessage({ text: 'Unable to load profile data.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage({ text: '', type: '' });
        try {
            const res = await api.put('/users/me', editProfile);
            setProfile(res.data);
            setIsEditingData(false);
            setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
            
            // If email changed, token might be invalid/inconsistent relying on old email
            // Just updating the local profile view is fine unless token rotation is heavily enforced
        } catch (error) {
            setProfileMessage({ 
                text: error.response?.data?.detail || 'Failed to update profile.', 
                type: 'error' 
            });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage({ text: '', type: '' });
        
        if (passwordData.new !== passwordData.confirm) {
            setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
            return;
        }
        
        if (passwordData.new.length < 6) {
            setPasswordMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
            return;
        }

        try {
            await api.put('/users/change-password', {
                current_password: passwordData.current,
                new_password: passwordData.new
            });
            setPasswordMessage({ text: 'Password changed successfully.', type: 'success' });
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            setPasswordMessage({ 
                text: error.response?.data?.detail || 'Failed to change password.', 
                type: 'error' 
            });
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <User className="h-8 w-8 text-blue-500" />
                Account Settings
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form & Security */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Personal Info</h2>
                            {!isEditingData && (
                                <button 
                                    onClick={() => setIsEditingData(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <Edit2 className="h-4 w-4" /> Edit
                                </button>
                            )}
                        </div>

                        {profileMessage.text && (
                            <div className={`p-3 rounded-lg mb-4 text-sm flexitems-center gap-2 ${profileMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {profileMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        required 
                                        disabled={!isEditingData}
                                        value={editProfile.name}
                                        onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                                        className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 py-2 border"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input 
                                        type="email" 
                                        required 
                                        disabled={!isEditingData}
                                        value={editProfile.email}
                                        onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                                        className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 py-2 border"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-500 capitalize shadow-sm border border-gray-200">
                                    {profile.role}
                                </div>
                            </div>

                            {isEditingData && (
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                                    >
                                        <Save className="h-4 w-4" /> Save
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsEditingData(false);
                                            setEditProfile({ name: profile.name, email: profile.email });
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 font-medium hover:bg-gray-300 flex items-center justify-center gap-2"
                                    >
                                        <X className="h-4 w-4" /> Cancel
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-green-500" /> Security
                        </h2>

                        {passwordMessage.text && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${passwordMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {passwordMessage.text}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={passwordData.current}
                                    onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-green-600 text-white rounded-md py-2 font-medium hover:bg-green-700 transition"
                            >
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column - Stats & History */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Spending Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center">
                            <div className="bg-blue-100 p-3 rounded-full mb-3">
                                <ShoppingBag className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-800">{summary.total_orders}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center">
                            <div className="bg-green-100 p-3 rounded-full mb-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-gray-800">{summary.completed_orders}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center">
                            <div className="bg-gray-100 p-3 rounded-full mb-3">
                                <CreditCard className="h-6 w-6 text-gray-600" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Total Spent</p>
                            <p className="text-2xl font-bold text-gray-800">₹{summary.total_spent.toFixed(2)}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center">
                            <div className="bg-red-100 p-3 rounded-full mb-3">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Cancelled</p>
                            <p className="text-2xl font-bold text-gray-800">{summary.cancelled_orders}</p>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-500" /> Past Orders
                            </h2>
                        </div>
                        
                        {orders.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                <p>You haven't placed any orders yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Order ID</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Date</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Items</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Total</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => {
                                            const getStatusColor = (status) => {
                                                switch(status.toLowerCase()) {
                                                    case 'completed': return 'bg-green-100 text-green-700';
                                                    case 'pending': return 'bg-yellow-100 text-yellow-700';
                                                    case 'ready': return 'bg-blue-100 text-blue-700';
                                                    case 'cancelled': return 'bg-red-100 text-red-700';
                                                    case 'preparing': return 'bg-orange-100 text-orange-700';
                                                    default: return 'bg-gray-100 text-gray-700';
                                                }
                                            };

                                            const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            });

                                            return (
                                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">#{order.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{date}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            {order.items.map(item => (
                                                                <span key={item.id} className="text-sm">
                                                                    {item.quantity}x {item.food_item.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-gray-900">₹{order.total_amount.toFixed(2)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
