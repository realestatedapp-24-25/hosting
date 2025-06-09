import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, Package, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ShopDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/donations/shop-donations', {
        withCredentials: true
      });
      setDonations(response.data.data.donations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch donations');
      toast.error(err.response?.data?.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mycol-sea_green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shop Donations</h1>
        </div>

        {donations.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No donations found</h3>
            <p className="text-gray-500">You haven't received any donations yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {donations.map((donation) => (
              <motion.div
                key={donation._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Donation #{donation._id.slice(-6)}
                      </h3>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(donation.status)}`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium text-gray-700">{donation.donor.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{donation.donor.email}</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Donated Items:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {donation.items.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-800">
                            {item.item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.item.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShopDonations; 