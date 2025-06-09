import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPackage, FiClock, FiMapPin, FiPhone, FiMail, FiSearch, FiFilter, FiX, FiAlertCircle, FiCalendar, FiArrowRight, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Search states
  const [searchParams, setSearchParams] = useState({
    institute_name: '',
    institute_type: '',
    category: '',
    status: '',
    urgency: ''
  });

  // Constants for dropdowns with enhanced visuals
  const INSTITUTE_TYPES = [
    { value: 'ORPHANAGE', label: 'Orphanage', emoji: '👶', color: 'bg-blue-100 text-blue-800' },
    { value: 'ELDERLY_HOME', label: 'Elderly Home', emoji: '👴', color: 'bg-purple-100 text-purple-800' },
    { value: 'FOOD_PROVIDER', label: 'Food Provider', emoji: '🍲', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const CATEGORIES = [
    { value: 'FOOD', label: 'Food', icon: '🍲', color: 'bg-orange-100 text-orange-800' },
    { value: 'MEDICAL', label: 'Medical', icon: '💊', color: 'bg-red-100 text-red-800' },
    { value: 'EDUCATION', label: 'Education', icon: '📚', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'CLOTHING', label: 'Clothing', icon: '👕', color: 'bg-blue-100 text-blue-800' },
    { value: 'OTHER', label: 'Other', icon: '📦', color: 'bg-gray-100 text-gray-800' }
  ];

  const URGENCY_LEVELS = [
    { value: 'HIGH', label: 'High Priority', color: 'bg-red-100 text-red-800', icon: '🔴' },
    { value: 'MEDIUM', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    { value: 'LOW', label: 'Low Priority', color: 'bg-green-100 text-green-800', icon: '🟢' }
  ];

  const STATUS_TYPES = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'partially_fulfilled', label: 'Partially Fulfilled', color: 'bg-blue-100 text-blue-800' },
    { value: 'fulfilled', label: 'Fulfilled', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
    fetchRequests();
  }, [searchParams]);

  // Utility function to normalize server response data
  const transformRequest = (request) => {
    // Convert status with spaces to underscores for frontend use
    let normalizedStatus = request.status || 'pending';
    normalizedStatus = normalizedStatus.replace(/ /g, '_');
    
    return {
      ...request,
      institute: request.institute || null,
      status: normalizedStatus,
      items: Array.isArray(request.items) ? request.items : []
    };
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Check if any filters are applied
      const hasActiveFilters = Object.values(searchParams).some(value => value && value.trim() !== '');
      
      let requestUrl = '/api/v1/requests'; // Default endpoint for all requests
      let queryParams = new URLSearchParams();
      
      // Only build query params and use search endpoint if filters are applied
      if (hasActiveFilters) {
        Object.entries(searchParams).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            // Format values based on the parameter
            let formattedValue = value;
            if (key === 'institute_type') {
              formattedValue = value.toUpperCase();
            } else if (key === 'status') {
              // Convert frontend status format to backend status format (replace underscores with spaces)
              formattedValue = value.toLowerCase().replace(/_/g, ' ');
            } else if (key === 'category') {
              formattedValue = value.toUpperCase(); // Ensure category is uppercase to match backend enum
            }
            
            console.log(`Adding filter: ${key}=${formattedValue}`);
            queryParams.append(key, formattedValue);
          }
        });
        
        // Use search endpoint with query params when filters are applied
        requestUrl = `/api/v1/requests/search?${queryParams}`;
      }
      
      console.log('Requesting:', requestUrl);
      
      const response = await axios.get(requestUrl, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Log response for debugging
      console.log('Response data:', response.data);

      // The response structure should be the same for both endpoints
      // but let's make it more explicit for clarity
      let requestsData = [];
      if (response.data && response.data.data) {
        requestsData = response.data.data.requests || [];
      }
      
      // Validate and transform the data
      const validatedRequests = requestsData.map(request => transformRequest(request));

      setRequests(validatedRequests);
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      // More specific error handling
      if (err.response?.status === 403) {
        setError('You do not have permission to view requests');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch requests');
      }
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchParams({
      institute_name: '',
      institute_type: '',
      category: '',
      status: '',
      urgency: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInstituteTypeIcon = (type) => {
    if (!type) return '🏢';
    
    switch (type.toUpperCase()) {
        case 'ORPHANAGE':
            return '👶';
        case 'ELDERLY_HOME':
            return '👴';
        case 'FOOD_PROVIDER':
            return '🍲';
        default:
            return '🏢';
    }
  };
  
  // Function to get category icon
  const getCategoryIcon = (category) => {
    if (!category) return '📦';
    
    const foundCategory = CATEGORIES.find(cat => cat.value === category);
    return foundCategory ? foundCategory.icon : '📦';
  };
  
  // Function to get status color
  const getStatusColor = (status) => {
    if (status === 'pending') return 'from-amber-500 to-orange-500';
    if (status === 'partially_fulfilled') return 'from-blue-500 to-indigo-500';
    if (status === 'fulfilled') return 'from-emerald-500 to-teal-500';
    return 'from-gray-500 to-slate-500';
  };

  // Function to format status nicely
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    
    // Convert from backend format (with spaces) to frontend format (with underscores) if needed
    const normalizedStatus = status.replace(/ /g, '_');
    
    // Handle different status types
    if (normalizedStatus === 'partially_fulfilled') {
      return 'Partially Fulfilled';
    }
    
    // Default capitalization for other statuses
    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-800 via-violet-700 to-purple-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-800/60 to-transparent"></div>
        
        {/* Animated Circles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200"
          >
            Donation Requests
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-indigo-100 max-w-2xl"
          >
            Browse and fulfill donation requests from institutes in need. Your contributions can make a meaningful difference.
          </motion.p>
        </div>
      </div>

      {/* Search and Content Section */}
      <div className="container mx-auto px-4 -mt-10 mb-20">
        {/* Search Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-12 backdrop-blur-lg border border-indigo-50 relative z-10"
        >
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-5 mb-8">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiSearch className="text-indigo-400 text-xl" />
              </div>
              <input
                type="text"
                placeholder="Search by institute name..."
                value={searchParams.institute_name}
                onChange={(e) => handleSearchChange('institute_name', e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-lg shadow-sm"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 flex items-center justify-center gap-2 text-lg font-medium shadow-lg hover:shadow-indigo-200"
            >
              {showFilters ? <FiX className="text-xl" /> : <FiFilter className="text-xl" />}
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </motion.button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  {/* Institute Type Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-indigo-900 ml-1">
                      Institute Type
                    </label>
                    <div className="relative">
                      <select
                        value={searchParams.institute_type}
                        onChange={(e) => handleSearchChange('institute_type', e.target.value)}
                        className="w-full p-3 pl-4 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 appearance-none bg-white shadow-sm text-gray-700"
                      >
                        <option value="">All Types</option>
                        {INSTITUTE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.emoji} {type.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-400">
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-indigo-900 ml-1">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={searchParams.category}
                        onChange={(e) => handleSearchChange('category', e.target.value)}
                        className="w-full p-3 pl-4 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 appearance-none bg-white shadow-sm text-gray-700"
                      >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-400">
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-indigo-900 ml-1">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={searchParams.status}
                        onChange={(e) => handleSearchChange('status', e.target.value)}
                        className="w-full p-3 pl-4 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 appearance-none bg-white shadow-sm text-gray-700"
                      >
                        <option value="">All Status</option>
                        {STATUS_TYPES.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-400">
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Urgency Filter */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-indigo-900 ml-1">
                      Urgency
                    </label>
                    <div className="relative">
                      <select
                        value={searchParams.urgency}
                        onChange={(e) => handleSearchChange('urgency', e.target.value)}
                        className="w-full p-3 pl-4 border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all duration-300 appearance-none bg-white shadow-sm text-gray-700"
                      >
                        <option value="">All Urgency Levels</option>
                        {URGENCY_LEVELS.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.icon} {level.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-indigo-400">
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20">
                          <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearFilters}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-all duration-300 font-medium"
                  >
                    <FiX className="text-lg" />
                    Clear All Filters
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 flex justify-between items-center"
        >
          <div className="flex items-center gap-2 text-indigo-900 bg-indigo-50 px-4 py-2 rounded-lg">
            <FiPackage className="text-indigo-600" />
            <span className="font-medium">Found {requests.length} requests</span>
          </div>
          
          {!loading && requests.length > 0 && (
            <div className="text-sm text-gray-500">
              Updated just now
            </div>
          )}
        </motion.div>

        {/* Request Cards */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="w-20 h-20 relative">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-indigo-200 opacity-25"></div>
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-indigo-600 animate-spin"></div>
            </div>
            <p className="mt-6 text-indigo-800 font-medium">Loading requests...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-12 bg-red-50 rounded-2xl border border-red-100 shadow-lg"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-6">
              <FiAlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-3">Unable to Load Requests</h3>
            <p className="text-red-600 max-w-md mx-auto">{error}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 border border-indigo-50"
              >
                {/* Card Header with Status */}
                <div className={`bg-gradient-to-r ${getStatusColor(request.status)} px-6 py-4 flex justify-between items-center`}>
                  <h3 className="text-lg font-bold text-white truncate">
                    {request.institute?.institute_name || 'Unknown Institute'}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                    {formatStatus(request.status)}
                  </span>
                </div>
                
                <div className="p-6">
                  {/* Institute Info */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-xl">
                      {getInstituteTypeIcon(request.institute?.institute_type)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        {request.institute?.institute_type ? 
                          request.institute.institute_type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ') 
                          : 'Unknown Type'
                        }
                      </p>
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiCalendar className="text-indigo-400" size={14} />
                        <span className="text-sm">{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Request Items */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <FiPackage className="text-indigo-500" />
                        Requested Items
                      </h4>
                      {request.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {getCategoryIcon(request.category)} {request.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-4">
                      <ul className="space-y-2">
                        {request.items.slice(0, 3).map((item, index) => (
                          <li key={index} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm border-l-4 border-indigo-400">
                            <span className="font-medium text-gray-800">{item.name}</span>
                            <span className="text-indigo-600 font-semibold">{item.quantity} {item.unit}</span>
                          </li>
                        ))}
                        {request.items.length > 3 && (
                          <li className="text-center text-sm text-indigo-600 font-medium py-1">
                            + {request.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/requests/${request._id}`)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-md group-hover:shadow-indigo-200"
                  >
                    <span>View Details</span>
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg border border-indigo-50"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 mb-6">
              <FiInfo className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-indigo-900 mb-3">No Requests Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">Try adjusting your filters or search terms to find more results.</p>
            
            {/* Suggestion Button */}
            <button 
              onClick={clearFilters}
              className="mt-6 inline-flex items-center px-6 py-3 border border-indigo-300 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300 font-medium"
            >
              <FiX className="mr-2" />
              Clear All Filters
            </button>
          </motion.div>
        )}
        
        {/* Support Message */}
        {!loading && requests.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-2">Can't find what you're looking for?</p>
            <button 
              onClick={() => navigate('/contact')} 
              className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
            >
              Contact our support team
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestList; 