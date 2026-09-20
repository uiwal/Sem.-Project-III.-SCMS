import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { name, email, password });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-yellow-100 rounded-full">
                        <UserPlus className="h-10 w-10 text-yellow-600" />
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Create Account</h2>
                <p className="text-center text-gray-500 mb-8">Join CampusBite AI today</p>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Full Name</label>
                        <input
                            type="text" required
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:bg-white outline-none transition"
                            value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Email Address</label>
                        <input
                            type="email" required
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:bg-white outline-none transition"
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700">Password</label>
                        <input
                            type="password" required
                            className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:bg-white outline-none transition"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl text-lg font-extrabold text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-transform active:scale-95 mt-4 shadow-sm"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-8 text-center text-sm font-medium text-gray-600">
                    Already have an account? <Link to="/login" className="text-yellow-600 hover:text-yellow-700 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
