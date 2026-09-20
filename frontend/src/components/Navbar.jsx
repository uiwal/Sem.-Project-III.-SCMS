import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, ShoppingCart, Utensils, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-primary text-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <Utensils className="h-8 w-8 text-yellow-300" />
                            <span className="font-bold text-2xl tracking-wider">CampusBite <span className="text-yellow-300">AI</span></span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-sm border border-red-400 bg-red-700 px-3 py-1 rounded-full capitalize">
                                    {user.role}
                                </span>

                                {user.role === 'student' && (
                                    <Link to="/cart" className="p-2 hover:bg-red-700 rounded-full cursor-pointer relative">
                                        <ShoppingCart className="h-6 w-6" />
                                    </Link>
                                )}

                                {(user.role === 'staff' || user.role === 'admin') && (
                                    <Link to={`/${user.role}`} className="p-2 hover:bg-red-700 rounded-full cursor-pointer">
                                        <LayoutDashboard className="h-6 w-6" />
                                    </Link>
                                )}

                                <button onClick={logout} className="p-2 hover:bg-red-700 rounded-full cursor-pointer">
                                    <LogOut className="h-6 w-6" />
                                </button>
                            </>
                        ) : (
                            <div className="space-x-2">
                                <Link to="/login" className="px-4 py-2 hover:bg-red-700 rounded-md font-medium">Login</Link>
                                <Link to="/register" className="px-4 py-2 bg-yellow-400 text-gray-900 hover:bg-yellow-300 rounded-md font-bold transition-all">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
