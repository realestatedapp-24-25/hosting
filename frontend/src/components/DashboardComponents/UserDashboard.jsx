import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  User,
  Heart,
  Package,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Building,
  Award,
  Activity,
  Gift,
  CheckCircle,
  AlertCircle,
  Clock4
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalDonations: 0,
    pendingDonations: 0,
    successfulDonations: 0,
    impactScore: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/v1/users/dashboard', {
          withCredentials: true
        });
        
        if (response.data.status === 'success' && response.data.data) {
          setStats(response.data.data.stats || {
            totalDonations: 0,
            pendingDonations: 0,
            successfulDonations: 0,
            impactScore: 0
          });
          setRecentActivity(response.data.data.recentActivity || []);
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.response?.data?.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const roleBasedColor = {
    donor: "from-purple-500 to-indigo-600",
    institute: "from-emerald-500 to-teal-600",
    shopkeeper: "from-amber-500 to-orange-600",
    admin: "from-blue-500 to-cyan-600"
  };

  const gradientClass = roleBasedColor[user?.role] || "from-gray-500 to-gray-600";

  const StatCard = ({ icon: Icon, title, value, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${gradientClass} bg-opacity-10`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          </div>
        </div>
        {trend && (
          <div className="flex items-center text-emerald-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{trend}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );

  const ActivityItem = ({ activity }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className={`p-2 rounded-full bg-gradient-to-r ${gradientClass}`}>
        {activity.type === 'donation' && <Gift className="h-5 w-5 text-white" />}
        {activity.type === 'status_update' && <CheckCircle className="h-5 w-5 text-white" />}
        {activity.type === 'request' && <AlertCircle className="h-5 w-5 text-white" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
        <div className="flex items-center mt-1">
          <Clock4 className="h-4 w-4 text-gray-400 mr-1" />
          <p className="text-xs text-gray-500">{activity.timestamp}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl bg-gradient-to-r ${gradientClass} text-white`}
          >
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
                <p className="text-white/80 mt-1">Here's what's happening with your account</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton for stats
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-gray-200 h-12 w-12"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-6 bg-gray-200 rounded w-16 mt-2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-4 bg-red-50 p-4 rounded-lg">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          ) : (
            // Actual stats
            <>
              <StatCard
                icon={Heart}
                title="Total Donations"
                value={stats.totalDonations}
                trend={12}
              />
              <StatCard
                icon={Package}
                title="Pending Donations"
                value={stats.pendingDonations}
              />
              <StatCard
                icon={CheckCircle}
                title="Successful Donations"
                value={stats.successfulDonations}
                trend={8}
              />
              <StatCard
                icon={Award}
                title="Impact Score"
                value={stats.impactScore}
                trend={15}
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6 lg:col-span-1"
          >
            <h2 className="text-xl font-semibold mb-6">Account Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600 capitalize">{user?.role}</span>
              </div>
              {user?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-600">{user.address.street}</p>
                    <p className="text-gray-600">{user.address.city}, {user.address.state}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">
                  Joined {new Date(user?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 