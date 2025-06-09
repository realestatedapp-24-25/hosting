import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiAlertCircle, FiCheckCircle, FiMapPin } from 'react-icons/fi';

const ShopkeeperDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get('/api/v1/donations/shop', {
        withCredentials: true
      });
      setDonations(response.data.data.donations);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDelivery = async (donationId) => {
    try {
      setVerificationError(null);
      
      // Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      await axios.post(`/api/v1/shipping/verify/${donationId}`, {
        latitude,
        longitude
      }, {
        withCredentials: true
      });

      // Refresh donations list after successful verification
      fetchDonations();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to verify delivery';
      setVerificationError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mycol-mint"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <FiAlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Donations</h1>

        {verificationError && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <FiAlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Verification Error</h3>
                <div className="mt-2 text-sm text-red-700">{verificationError}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {donations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No donations found</p>
          ) : (
            donations.map((donation) => (
              <div key={donation._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {donation.institute?.institute_name || 'Unknown Institute'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Status: <span className="font-medium">{donation.status}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Total Amount: <span className="font-medium">${donation.totalAmount}</span>
                    </p>
                  </div>
                  
                  {donation.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleVerifyDelivery(donation._id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mycol-mint hover:bg-mycol-mint-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mycol-mint"
                    >
                      <FiMapPin className="-ml-1 mr-2 h-5 w-5" />
                      Verify Delivery
                    </button>
                  )}

                  {donation.status === 'DELIVERED' && (
                    <div className="flex items-center text-green-600">
                      <FiCheckCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Delivered</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Items:</h3>
                  <ul className="mt-2 divide-y divide-gray-200">
                    {donation.items.map((item, index) => (
                      <li key={index} className="py-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">{item.itemName}</span>
                          <span className="text-sm text-gray-900">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperDonations;