import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPackage, FiClock, FiMapPin, FiPhone, FiMail, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

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

  // Constants for dropdowns
  const INSTITUTE_TYPES = [
    { value: 'ORPHANAGE', label: 'Orphanage', emoji: '👶' },
    { value: 'OLD_AGE_HOME', label: 'Old Age Home', emoji: '👴' },
    { value: 'SHELTER', label: 'Shelter', emoji: '🏠' },
    { value: 'OTHER', label: 'Other', emoji: '🏢' }
  ];

  const CATEGORIES = [
    { value: 'FOOD', label: 'Food' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'MEDICAL', label: 'Medical' },
    { value: 'OTHER', label: 'Other' }
  ];

  const URGENCY_LEVELS = [
    { value: 'HIGH', label: 'High Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'LOW', label: 'Low Priority' }
  ];

  useEffect(() => {
    fetchRequests();
  }, [searchParams]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Build query string from searchParams
      const queryParams = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(`/api/v1/requests/search?${queryParams}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Validate and transform the data if needed
      const validatedRequests = response.data.data.requests.map(request => ({
        ...request,
        institute: request.institute || null,
        status: request.status || 'pending',
        items: Array.isArray(request.items) ? request.items : []
      }));

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
        case 'OLD_AGE_HOME':
            return '👴';
        case 'SHELTER':
            return '🏠';
        case 'FOOD_PROVIDER':
            return '🍲';
        default:
            return '🏢';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2">
      {/* Hero Section */}
      <div className="bg-mycol-brunswick_green text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Donation Requests</h1>
          <p className="text-xl">Support institutes in need by fulfilling their requests</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by institute name..."
                value={searchParams.institute_name}
                onChange={(e) => handleSearchChange('institute_name', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-mycol-mint text-white rounded-lg hover:bg-mycol-mint-2 transition-colors flex items-center gap-2"
            >
              <FiFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Institute Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Type
                </label>
                <select
                  value={searchParams.institute_type}
                  onChange={(e) => handleSearchChange('institute_type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                >
                  <option value="">All Types</option>
                  {INSTITUTE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.emoji} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={searchParams.category}
                  onChange={(e) => handleSearchChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={searchParams.status}
                  onChange={(e) => handleSearchChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="partially_fulfilled">Partially Fulfilled</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency
                </label>
                <select
                  value={searchParams.urgency}
                  onChange={(e) => handleSearchChange('urgency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint"
                >
                  <option value="">All Urgency Levels</option>
                  {URGENCY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Clear Filters Button */}
          {showFilters && (
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <FiX />
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Found {requests.length} requests
        </div>

        {/* Request Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mycol-mint"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  {/* Institute Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getInstituteTypeIcon(request.institute?.institute_type)}
                        </span>
                        <h3 className="text-lg font-semibold text-mycol-brunswick_green">
                          {request.institute?.institute_name || 'Unknown Institute'}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {request.institute?.institute_type ? 
                            request.institute.institute_type.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(' ') 
                            : 'Unknown Type'
                        }
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'partially_fulfilled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {request.status ? 
                          request.status.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                          ).join(' ')
                          : 'Unknown Status'
                      }
                    </span>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-4">
                    {/* Items */}
                    <div className="flex items-start">
                      <FiPackage className="mt-1 mr-2 text-mycol-mint" />
                      <div>
                        <p className="font-medium text-gray-700">Requested Items:</p>
                        <ul className="mt-1 space-y-1">
                          {request.items.map((item, index) => (
                            <li key={index} className="text-gray-600 flex items-center gap-2">
                              <span>•</span>
                              <span>
                                {item.name} - {item.quantity} {item.unit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center text-gray-600">
                      <FiClock className="mr-2 text-mycol-mint" />
                      <span>Requested on: {formatDate(request.createdAt)}</span>
                    </div>

                    {/* Location */}
                    {request.institute?.geolocation && (
                      <div className="flex items-center text-gray-600">
                        <FiMapPin className="mr-2 text-mycol-mint" />
                        <span>Location available</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => navigate(`/requests/${request._id}`)}
                        className="px-4 py-2 bg-mycol-mint text-white rounded-lg hover:bg-mycol-mint-2 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-lg">No requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestList; 