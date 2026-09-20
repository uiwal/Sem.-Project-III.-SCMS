import React, { useState, useEffect } from 'react';
import api from '../api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Target, TrendingUp, Users } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
    const [demandData, setDemandData] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [demandRes, orderRes] = await Promise.all([
                    api.get('/ai/demand-prediction'),
                    api.get('/orders/all')
                ]);
                setDemandData(demandRes.data);
                setOrders(orderRes.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
    }, []);

    const chartData = {
        labels: demandData?.labels || [],
        datasets: [
            {
                label: 'Predicted Demand (Orders)',
                data: demandData?.predicted || [],
                borderColor: '#C31432',
                backgroundColor: 'rgba(195, 20, 50, 0.2)',
                borderWidth: 3,
                pointBackgroundColor: '#240B36',
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false }
        }
    };

    const totalSales = orders.reduce((acc, order) => acc + (order.status === 'Completed' ? order.total_amount : 0), 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-2">
                <Target className="text-primary h-8 w-8" /> Admin Intelligence Dashboard
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-green-100 rounded-full text-green-700"><TrendingUp className="w-8 h-8" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase">Total Revenue</p>
                        <p className="text-3xl font-black text-gray-900">₹{totalSales}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-full text-blue-700"><Users className="w-8 h-8" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase">Total Orders</p>
                        <p className="text-3xl font-black text-gray-900">{orders.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Demand Prediction (Next 7 Days)</h2>
                {demandData?.labels?.length > 0 ? (
                    <div className="h-[400px]">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-xl">
                        <p className="text-gray-500 font-bold">Not enough historical data to generate predictions.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
