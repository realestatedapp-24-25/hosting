import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiAward, FiTrendingUp, FiHeart, FiPackage, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ImpactDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/v1/users/dashboard', {
          withCredentials: true,
        });
        if (response.data.status === 'success') {
          setDashboardData(response.data.data);
        } else {
          toast.error('Failed to fetch dashboard data');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatActivityDescription = (activity) => {
    if (!activity || !activity.items) return '';
    
    const instituteName = activity.institute?.name || 'an institute';
    const itemCount = activity.items.length;
    
    if (itemCount === 0) return '';
    
    return `Donated ${itemCount} item${itemCount !== 1 ? 's' : ''} to ${instituteName}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mycol-mint"></div>
      </div>
    );
  }

  const achievements = [
    {
      title: "First Time Donor",
      description: "Made your first donation",
      icon: <FiHeart className="w-8 h-8 text-pink-500" />,
      unlocked: dashboardData?.stats.totalDonations > 0,
    },
    {
      title: "Impact Maker",
      description: "Reached 100 impact points",
      icon: <FiStar className="w-8 h-8 text-yellow-500" />,
      unlocked: dashboardData?.stats.impactScore >= 100,
    },
    {
      title: "Regular Supporter",
      description: "Made 5+ successful donations",
      icon: <FiAward className="w-8 h-8 text-purple-500" />,
      unlocked: dashboardData?.stats.successfulDonations >= 5,
    },
    {
      title: "Generous Heart",
      description: "Donated to multiple institutes",
      icon: <FiPackage className="w-8 h-8 text-blue-500" />,
      unlocked: true, // You can add logic based on your data
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-mycol-brunswick_green mb-2">Your Impact Dashboard</h1>
        <p className="text-gray-600">Track your contribution and achievements</p>
      </div>

      {/* Impact Score Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-mycol-mint to-mycol-sea_green rounded-xl shadow-lg p-8 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-2xl font-semibold mb-2">Impact Score</h2>
            <p className="text-white text-5xl font-bold">{dashboardData?.stats.impactScore || 0}</p>
          </div>
          <FiTrendingUp className="w-16 h-16 text-white opacity-50" />
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-mycol-brunswick_green">{dashboardData?.stats.totalDonations || 0}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Successful Donations</h3>
          <p className="text-3xl font-bold text-green-600">{dashboardData?.stats.successfulDonations || 0}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Donations</h3>
          <p className="text-3xl font-bold text-yellow-500">{dashboardData?.stats.pendingDonations || 0}</p>
        </motion.div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-mycol-brunswick_green mb-6">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${
                achievement.unlocked
                  ? 'border-mycol-mint bg-mycol-celadon bg-opacity-10'
                  : 'border-gray-200 opacity-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                {achievement.icon}
                <div>
                  <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-mycol-brunswick_green mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
            dashboardData.recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
              >
                <div>
                  <p className="text-gray-800">{formatActivityDescription(activity)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="font-medium text-mycol-brunswick_green">
                    ₹{activity.amount?.toLocaleString() || 0}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              No donation activity yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard; 