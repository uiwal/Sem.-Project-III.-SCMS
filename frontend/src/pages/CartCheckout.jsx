import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Trash2, QrCode, CreditCard, Banknote, Clock, CheckCircle } from 'lucide-react';

export default function CartCheckout() {
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [placedOrder, setPlacedOrder] = useState(null);
    const [waitTime, setWaitTime] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    }, []);

    const updateQuantity = (index, delta) => {
        const newCart = [...cart];
        newCart[index].quantity += delta;
        if (newCart[index].quantity <= 0) newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    const total = cart.reduce((acc, item) => acc + item.itemDetails.price * item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const orderPayload = {
                items: cart.map(c => ({ food_item_id: c.food_item_id, quantity: c.quantity })),
                payment_method: paymentMethod
            };
            const res = await api.post('/orders/', orderPayload);
            setPlacedOrder(res.data);
            localStorage.removeItem('cart');
            setCart([]);

            // Fetch AI wait time estimate
            const waitRes = await api.get('/ai/wait-time');
            setWaitTime(waitRes.data.estimated_wait_minutes);
        } catch (err) {
            alert("Checkout failed!");
        }
    };

    if (placedOrder) {
        return (
            <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-lg text-center border border-gray-100">
                <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
                <p className="text-gray-500 mb-8 text-lg">Your order #{placedOrder.id} has been placed successfully.</p>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 inline-block w-full max-w-md">
                    <div className="flex items-center justify-center gap-3 text-blue-800 mb-2">
                        <Clock className="w-8 h-8" />
                        <span className="text-2xl font-bold">AI ETA: {waitTime || 'Wait...'} mins</span>
                    </div>
                    <p className="text-sm text-blue-600">Based on real-time kitchen queue analysis</p>
                </div>

                <div className="p-8 bg-gray-50 rounded-2xl max-w-sm mx-auto shadow-inner border border-dashed border-gray-300">
                    <QrCode className="h-40 w-40 text-gray-800 mx-auto mb-4" />
                    <p className="font-bold text-gray-900 text-xl font-mono tracking-widest">{placedOrder.qr_code}</p>
                    <p className="text-sm text-gray-500 mt-2">Show this code at the counter</p>
                </div>

                <button onClick={() => navigate('/menu')} className="mt-10 px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition">
                    Back to Menu
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50"><h2 className="text-2xl font-bold text-gray-900">Your Cart</h2></div>
                <div className="p-6 space-y-6">
                    {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-10 text-lg">Your cart is empty.</p>
                    ) : (
                        cart.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{item.itemDetails.name}</h3>
                                    <p className="text-primary font-bold">₹{item.itemDetails.price}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-gray-100 rounded-lg">
                                        <button onClick={() => updateQuantity(idx, -1)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-l-lg">-</button>
                                        <span className="px-4 font-bold w-12 text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(idx, 1)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-r-lg">+</button>
                                    </div>
                                    <button onClick={() => updateQuantity(idx, -item.quantity)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="lg:w-1/3">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sticky top-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                    <div className="flex justify-between mb-4 text-gray-600">
                        <span>Subtotal ({cart.length} items)</span>
                        <span className="font-bold text-gray-900">₹{total}</span>
                    </div>
                    <div className="flex justify-between mb-6 pb-6 border-b border-gray-100">
                        <span>Platform Fee</span>
                        <span className="font-bold text-gray-900">₹0</span>
                    </div>
                    <div className="flex justify-between text-2xl font-extrabold text-primary mb-8">
                        <span>Total</span>
                        <span>₹{total}</span>
                    </div>

                    <h3 className="font-bold text-gray-700 mb-3">Payment Method</h3>
                    <div className="space-y-3 mb-8">
                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${paymentMethod === 'UPI' ? 'border-primary bg-red-50' : 'border-gray-200 bg-white'}`}>
                            <input type="radio" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="hidden" />
                            <QrCode className={`w-6 h-6 mr-3 ${paymentMethod === 'UPI' ? 'text-primary' : 'text-gray-400'}`} />
                            <span className={`font-bold ${paymentMethod === 'UPI' ? 'text-primary' : 'text-gray-600'}`}>Pay via UPI / QR</span>
                        </label>
                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer ${paymentMethod === 'Cash' ? 'border-primary bg-red-50' : 'border-gray-200 bg-white'}`}>
                            <input type="radio" value="Cash" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} className="hidden" />
                            <Banknote className={`w-6 h-6 mr-3 ${paymentMethod === 'Cash' ? 'text-primary' : 'text-gray-400'}`} />
                            <span className={`font-bold ${paymentMethod === 'Cash' ? 'text-primary' : 'text-gray-600'}`}>Pay via Cash at Counter</span>
                        </label>
                    </div>

                    <button
                        disabled={cart.length === 0}
                        onClick={handleCheckout}
                        className="w-full py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-red-700 focus:outline-none transition-transform active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                    >
                        Place Order
                    </button>
                </div>
            </div>
        </div>
    );
}
