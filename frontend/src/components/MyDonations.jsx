import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
    FiPackage,
    FiCalendar,
    FiMapPin,
    FiHome,
    FiTrendingUp,
    FiFilter,
    FiSearch,
    FiGrid,
    FiList
} from 'react-icons/fi';

const MyDonations = () => {
    const navigate = useNavigate();
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchDonations();
    }, []);

    const fetchDonations = async () => {
        try {
            const response = await axios.get('/api/v1/donors/my-donations', {
                withCredentials: true
            });
            setDonations(response.data.data.donations);
            setError(null);
            
            // Show total donations count
            toast.success(`Successfully loaded ${response.data.results} donations`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch donations';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter donations based on search term and status
    const filteredDonations = donations.filter(donation => {
        const matchesSearch = 
            donation.institute.institute_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donation.shop.shopName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === 'all' || 
            donation.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // Calculate total donation amount
    const totalDonationAmount = donations.reduce((sum, donation) => sum + donation.totalAmount, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-mycol-brunswick_green mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your donations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 flex items-center justify-center p-4">
                <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Donations</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-mycol-brunswick_green text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    if (!donations.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md"
                >
                    <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Donations Yet</h2>
                    <p className="text-gray-600 mb-6">Start making a difference by donating to those in need.</p>
                    <button
                        onClick={() => navigate('/donate')}
                        className="px-6 py-3 bg-mycol-brunswick_green text-white rounded-lg hover:bg-opacity-90 transform transition-all hover:scale-105"
                    >
                        Make Your First Donation
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 py-8 px-4">
            <div className="container mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-mycol-brunswick_green mb-2">My Donations</h2>
                            <p className="text-gray-600">Total Contribution: ₹{totalDonationAmount.toLocaleString('en-IN')}</p>
                        </div>
                        <button
                            onClick={() => navigate('/donate')}
                            className="mt-4 md:mt-0 px-6 py-3 bg-mycol-brunswick_green text-white rounded-lg hover:bg-opacity-90 transform transition-all hover:scale-105 flex items-center"
                        >
                            <FiTrendingUp className="mr-2" />
                            Make New Donation
                        </button>
                    </div>

                    {/* Filters and Search */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by institute or shop name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mycol-brunswick_green/20"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mycol-brunswick_green/20"
                            >
                                <option value="all">All Status</option>
                                <option value="processing">Processing</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                            >
                                {viewMode === 'grid' ? <FiList size={20} /> : <FiGrid size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Donations Grid/List */}
                <div className={viewMode === 'grid' ? "grid gap-6 lg:grid-cols-2" : "space-y-6"}>
                    {filteredDonations.map((donation) => (
                        <motion.div
                            key={donation._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                                viewMode === 'list' ? 'flex' : ''
                            }`}
                        >
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-mycol-brunswick_green mb-2">
                                            {donation.shop.shopName}
                                        </h3>
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <FiHome className="mr-2" />
                                            <span>{donation.institute.institute_name}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <FiMapPin className="mr-2" />
                                            <span>
                                                {donation.institute.user.address.street}, {donation.institute.user.address.city}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        donation.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                        donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                                    </span>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-2 flex items-center">
                                        <FiPackage className="mr-2" />
                                        Donated Items
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {donation.items.map((item, index) => (
                                            <div key={index} className="bg-gray-50 p-2 rounded">
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {item.quantity} {item.unit}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    <div className="flex items-center text-gray-600">
                                        <FiCalendar className="mr-2" />
                                        <span>{new Date(donation.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                    <div className="font-bold text-mycol-brunswick_green">
                                        ₹{donation.totalAmount.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyDonations;