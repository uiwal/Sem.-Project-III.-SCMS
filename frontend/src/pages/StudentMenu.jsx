import React, { useState, useEffect } from 'react';
import api from '../api';
import { Search, Clock, Bot, Star, Info } from 'lucide-react';

export default function StudentMenu() {
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCat, setSelectedCat] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [foodRes, catRes, recRes] = await Promise.all([
                    api.get('/food/items'),
                    api.get('/food/categories'),
                    api.get('/ai/recommendations')
                ]);
                setFoods(foodRes.data);
                setCategories(catRes.data);
                setRecommendations(recRes.data);
            } catch (error) {
                console.error("Error fetching menu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addToCart = (item) => {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(c => c.food_item_id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ food_item_id: item.id, quantity: 1, itemDetails: item });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${item.name} added to cart!`);
    };

    const comboCat = categories.find(c => c.name === '🔥 Combos');
    const comboFoods = comboCat ? foods.filter(f => f.category_id === comboCat.id) : [];

    const filteredFoods = foods.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCat === '' || f.category_id === parseInt(selectedCat)) &&
        (!comboCat || f.category_id !== comboCat.id)
    );

    if (loading) return <div className="text-center py-20 text-xl font-bold text-gray-500">Loading Menu...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

            {/* AI Recommendations Section */}
            {recommendations.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <Bot className="text-primary h-8 w-8" />
                        <h2 className="text-2xl font-bold text-gray-900">AI Recommended For You</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {recommendations.slice(0, 5).map(rec => (
                            <div key={rec.food_id} className="bg-yellow-50 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden border border-yellow-200 group">
                                <div className="h-40 overflow-hidden relative">
                                    <img src={rec.image_url || 'https://via.placeholder.com/150'} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm"><Star className="w-3 h-3 fill-yellow-900" /> {rec.score} AI Score</div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 truncate">{rec.name}</h3>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="font-bold text-primary">₹{rec.price}</span>
                                        <button onClick={() => addToCart({ id: rec.food_id, name: rec.name, price: rec.price })} className="bg-yellow-400 text-yellow-900 text-sm px-3 py-1 rounded-full font-bold hover:bg-yellow-500 transition">Add</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Combos Section */}
            {comboFoods.length > 0 && (
                <section>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-extrabold text-orange-600 flex items-center gap-2">🔥 Combos</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-12">
                        {comboFoods.map(food => (
                            <div key={food.id} className="bg-orange-50 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-orange-200 flex flex-col group">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={food.image_url || 'https://via.placeholder.com/300'} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    {!food.is_available && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="text-white font-bold px-4 py-2 bg-red-600 rounded-lg">Out of Stock</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{food.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 md:mb-4">{food.description}</p>
                                    <div className="flex-grow"></div>
                                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4 bg-white py-2 px-3 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /> {food.prep_time_mins} mins</div>
                                        <div className="flex items-center gap-1"><Info className="w-4 h-4 text-green-500" /> Veg</div>
                                    </div>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="text-2xl font-extrabold text-orange-600">₹{food.price}</span>
                                        <button
                                            disabled={!food.is_available}
                                            onClick={() => addToCart(food)}
                                            className={`px-5 py-2 rounded-xl font-bold transition-transform active:scale-95 ${food.is_available ? 'bg-orange-500 text-white hover:shadow-md hover:bg-orange-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Main Menu Section */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <h2 className="text-3xl font-extrabold text-gray-900">Explore Menu</h2>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search food..."
                                className="pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-full md:w-64"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                            value={selectedCat}
                            onChange={e => setSelectedCat(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredFoods.map(food => (
                        <div key={food.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col group">
                            <div className="h-48 overflow-hidden relative">
                                <img src={food.image_url || 'https://via.placeholder.com/300'} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                {!food.is_available && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="text-white font-bold px-4 py-2 bg-red-600 rounded-lg">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{food.name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 md:mb-4">{food.description}</p>
                                <div className="flex-grow"></div>
                                <div className="flex justify-between items-center text-sm text-gray-600 mb-4 bg-gray-50 py-2 px-3 rounded-lg">
                                    <div className="flex items-center gap-1"><Clock className="w-4 h-4 text-blue-500" /> {food.prep_time_mins} mins</div>
                                    <div className="flex items-center gap-1"><Info className="w-4 h-4 text-green-500" /> Veg</div>
                                </div>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="text-2xl font-extrabold text-primary">₹{food.price}</span>
                                    <button
                                        disabled={!food.is_available}
                                        onClick={() => addToCart(food)}
                                        className={`px-5 py-2 rounded-xl font-bold transition-transform active:scale-95 ${food.is_available ? 'bg-primary text-white hover:shadow-md hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredFoods.length === 0 && (
                    <div className="text-center py-20">
                        <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">No Food Found</h3>
                        <p className="text-gray-500">Try adjusting your filters.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
