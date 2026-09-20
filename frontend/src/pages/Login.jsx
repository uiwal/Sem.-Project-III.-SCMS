import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const role = await login(email, password);
            if (role === 'student') window.location.href = '/menu';
            else if (role === 'staff') window.location.href = '/staff';
            else if (role === 'admin') window.location.href = '/admin';
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-animated-gradient p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8 transition-all hover:shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-red-100 rounded-full">
                        <Utensils className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-center text-gray-500 mb-8">Sign in to CampusBite AI</p>

                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform active:scale-95"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account? <Link to="/register" className="font-semibold text-primary hover:text-red-500">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
