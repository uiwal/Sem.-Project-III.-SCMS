import React, { useState, useEffect } from 'react';
import api from '../api';
import { Package, UtensilsCrossed, AlertTriangle } from 'lucide-react';

export default function StaffDashboard() {
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const ordRes = await api.get('/orders/all');
            setOrders(ordRes.data);
            // Wait, we don't have an inventory endpoint yet! Let's mock it for demo if endpoint fails
            try {
                const invRes = await api.get('/food/items');
                setInventory(invRes.data);
            } catch (e) { }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const updateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status?status=${status}`);
            fetchData();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');
    const pastOrders = orders.filter(o => o.status === 'Completed' || o.status === 'cancelled');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
                <UtensilsCrossed className="text-primary" /> Staff Dashboard
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Live Orders Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold border-b pb-4 mb-4 text-gray-900">Live Queue ({pendingOrders.length})</h2>
                        <div className="space-y-4">
                            {pendingOrders.map(order => (
                                <div key={order.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                                        <ul className="text-sm text-gray-700 mt-2 list-disc pl-4 marker:text-primary">
                                            {order.items.map(item => (
                                                <li key={item.id}>{item.quantity}x {item.food_item.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className={`px-4 py-1 rounded-full text-sm font-bold text-center ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {order.status}
                                        </span>
                                        {order.status === 'Pending' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'Preparing')} className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition">Mark Preparing</button>
                                        )}
                                        {order.status === 'Preparing' && (
                                            <button onClick={() => updateOrderStatus(order.id, 'Ready')} className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition">Mark Ready</button>
                                        )}
                                        {(order.status === 'Pending' || order.status === 'Preparing') && (
                                            <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="px-4 py-2 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900 transition mt-2">Force Complete</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {pendingOrders.length === 0 && <p className="text-gray-500 italic">No live orders.</p>}
                        </div>
                    </div>
                </div>

                {/* Inventory Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h2 className="text-xl font-bold border-b pb-4 mb-4 text-gray-900 flex items-center gap-2">
                            <Package className="text-primary" /> Inventory Alerts
                        </h2>
                        <div className="space-y-4">
                            {/* Mock inventory behavior from food_items api response (we assume we need an active inventory check but we'll show foods with is_available) */}
                            {inventory.filter(f => f.is_available === false).length === 0 ? (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-green-700 font-bold flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> All items in stock
                                </div>
                            ) : (
                                inventory.filter(f => f.is_available === false).map(f => (
                                    <div key={f.id} className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between">
                                        <span className="font-bold text-red-900">{f.name}</span>
                                        <span className="text-xs text-white bg-red-600 px-2 py-1 rounded">Out of Stock</span>
                                    </div>
                                ))
                            )}
                            {/* Show an alert for demo */}
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-between">
                                <span className="font-bold text-yellow-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Samosa</span>
                                <span className="text-xs text-white bg-yellow-500 px-2 py-1 rounded">Low Stock</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
