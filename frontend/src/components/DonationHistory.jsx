import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCalendar, FiDollarSign, FiPackage, FiPieChart, FiFilter, FiMapPin, FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Line, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstitute, setSelectedInstitute] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [institutes, setInstitutes] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get('/api/v1/donors/my-donations', {
        withCredentials: true,
      });
      
      if (response.data.status === 'success') {
        const donationData = response.data.data.donations;
        setDonations(donationData);
        processAnalytics(donationData);
        
        // Extract unique institutes
        const uniqueInstitutes = [...new Set(donationData
          .map(donation => donation.institute?.institute_name)
          .filter(name => name)
        )];
        setInstitutes(uniqueInstitutes);
      } else {
        toast.error('Failed to fetch donations');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (donationData) => {
    // Calculate total amount donated
    const totalAmount = donationData.reduce((sum, donation) => sum + donation.totalAmount, 0);
    
    // Calculate donation frequency by month
    const monthlyDonations = donationData.reduce((acc, donation) => {
      const month = new Date(donation.createdAt).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Calculate donation status distribution
    const statusDistribution = donationData.reduce((acc, donation) => {
      acc[donation.status] = (acc[donation.status] || 0) + 1;
      return acc;
    }, {});

    setAnalytics({
      totalAmount,
      monthlyDonations,
      statusDistribution,
    });
  };

  const lineChartData = {
    labels: Object.keys(analytics?.monthlyDonations || {}),
    datasets: [
      {
        label: 'Number of Donations',
        data: Object.values(analytics?.monthlyDonations || {}),
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(analytics?.statusDistribution || {}),
    datasets: [
      {
        data: Object.values(analytics?.statusDistribution || {}),
        backgroundColor: [
          '#4CAF50',
          '#FFC107',
          '#F44336',
        ],
      },
    ],
  };

  const filteredDonations = selectedInstitute === 'all'
    ? donations
    : donations.filter(d => d.institute?.institute_name === selectedInstitute);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mycol-mint"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-mycol-brunswick_green mb-2">Donation History</h1>
          <p className="text-sm sm:text-base text-gray-600">Track and analyze your giving journey</p>
        </div>
        <div className="w-full sm:w-auto flex items-center space-x-4">
          <FiFilter className="text-mycol-brunswick_green" />
          <select
            value={selectedInstitute}
            onChange={(e) => setSelectedInstitute(e.target.value)}
            className="w-full sm:w-auto border-2 border-mycol-celadon rounded-lg px-4 py-2 focus:outline-none focus:border-mycol-brunswick_green text-sm sm:text-base"
          >
            <option value="all">All Institutes</option>
            {institutes.map((institute, index) => (
              <option key={index} value={institute}>{institute}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <FiDollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-gray-600">Total Amount Donated</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                ₹{analytics?.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-gray-600">Total Donations</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{donations.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
              <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm sm:text-base text-gray-600">First Donation</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {new Date(donations[donations.length - 1]?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-mycol-brunswick_green mb-4">Monthly Donation Trend</h2>
          <div className="h-48 sm:h-64">
            <Line data={lineChartData} options={{ 
              maintainAspectRatio: false,
              responsive: true,
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
                  }
                }
              }
            }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6"
        >
          <h2 className="text-lg sm:text-xl font-bold text-mycol-brunswick_green mb-4">Donation Status Distribution</h2>
          <div className="h-48 sm:h-64">
            <Pie data={pieChartData} options={{ 
              maintainAspectRatio: false,
              responsive: true
            }} />
          </div>
        </motion.div>
      </div>

      {/* Donation List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold text-mycol-brunswick_green mb-4 sm:mb-6">Recent Donations</h2>
        <div className="space-y-4">
          {filteredDonations.length > 0 ? (
            filteredDonations.map((donation, index) => (
              <motion.div
                key={donation._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="p-2 bg-mycol-celadon bg-opacity-20 rounded-full shrink-0">
                        <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-mycol-sea_green" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 text-sm sm:text-base">
                          {donation.institute?.institute_name ? (
                            <>Donated to <span className="text-mycol-brunswick_green font-semibold">{donation.institute.institute_name}</span></>
                          ) : (
                            'Donation'
                          )}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                            <FiMapPin className="mr-2 shrink-0" />
                            <span className="line-clamp-2">
                              {donation.institute?.user?.address ? (
                                `${donation.institute.user.address.street}, ${donation.institute.user.address.city}, ${donation.institute.user.address.state} - ${donation.institute.user.address.pincode}`
                              ) : (
                                'Address not available'
                              )}
                            </span>
                          </p>
                          {donation.shop?.contactInfo && (
                            <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                              <FiPhone className="mr-2 shrink-0" />
                              {donation.shop.contactInfo.phone || donation.shop.contactInfo.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start space-y-0 sm:space-y-2 mt-2 sm:mt-0">
                      <p className="font-medium text-mycol-brunswick_green text-base sm:text-lg order-1 sm:order-none">
                        ₹{donation.totalAmount?.toLocaleString() || 0}
                      </p>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                        donation.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : donation.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium mb-1">Items:</p>
                        <div className="space-y-1">
                          {donation.items.map((item, idx) => (
                            <p key={idx} className="text-xs sm:text-sm text-gray-600">
                              • {item.quantity} {item.unit} of {item.name}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(donation.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        {donation.shop && (
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            <p>via {donation.shop.shopName}</p>
                            {donation.shop.contactInfo && (
                              <p className="text-xs mt-0.5">
                                Contact: {donation.shop.contactInfo.phone || donation.shop.contactInfo.email}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-6 sm:py-8">
              <FiPackage className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
              <p className="text-base sm:text-lg">No donations found</p>
              <p className="text-xs sm:text-sm">Start your giving journey today!</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DonationHistory; 