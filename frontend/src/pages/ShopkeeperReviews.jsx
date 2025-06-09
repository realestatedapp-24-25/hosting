import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, AlertCircle, SmilePlus, Meh, Frown, Package, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ShopkeeperReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    sentiments: { Positive: 0, Neutral: 0, Negative: 0 }
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get('/api/v1/reviews/my-reviews', {
        withCredentials: true
      });
      
      const reviewsData = response.data.data.reviews;
      setReviews(reviewsData);
      
      // Calculate statistics
      const total = reviewsData.length;
      const avgRating = total > 0 
        ? reviewsData.reduce((acc, review) => acc + review.rating, 0) / total 
        : 0;
      
      // Count sentiments
      const sentimentCounts = reviewsData.reduce((acc, review) => {
        acc[review.verdict] = (acc[review.verdict] || 0) + 1;
        return acc;
      }, {});

      // Prepare chart data
      const sortedReviews = [...reviewsData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const labels = sortedReviews.map(review => format(new Date(review.createdAt), 'MMM d'));
      const ratings = sortedReviews.map(review => review.rating);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Rating Trend',
            data: ratings,
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.4,
          },
        ],
      });

      setStats({
        averageRating: avgRating,
        totalReviews: total,
        sentiments: {
          Positive: sentimentCounts.Positive || 0,
          Neutral: sentimentCounts.Neutral || 0,
          Negative: sentimentCounts.Negative || 0
        }
      });

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get('/api/v1/reviews/download/my-shop', {
        responseType: 'blob',
        withCredentials: true
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reviews.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to download reviews');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getSentimentIcon = (verdict) => {
    switch (verdict) {
      case 'Positive':
        return <SmilePlus className="h-5 w-5 text-green-500" />;
      case 'Neutral':
        return <Meh className="h-5 w-5 text-yellow-500" />;
      case 'Negative':
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getSentimentColor = (verdict) => {
    switch (verdict) {
      case 'Positive':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Neutral':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Negative':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
            <AlertCircle className="h-5 w-5 text-red-400" />
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
            <p className="mt-2 text-sm text-gray-600">
              See what institutes are saying about your services
            </p>
          </div>
          <button
            onClick={handleDownloadExcel}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-mycol-mint hover:bg-mycol-sea_green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mycol-mint"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Excel
          </button>
        </div>

        {/* Rating Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Rating Trend</h2>
          <div className="h-[300px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: {
                      stepSize: 1
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Average Rating</h2>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              From {stats.totalReviews} reviews
            </p>
          </div>

          {/* Sentiment Distribution Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h2>
            <div className="space-y-3">
              {Object.entries(stats.sentiments).map(([sentiment, count]) => (
                <div key={sentiment} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getSentimentIcon(sentiment)}
                    <span className="ml-2 text-sm text-gray-600">{sentiment}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900">Total Reviews</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Package className="mr-1.5 h-5 w-5 text-gray-400" />
              <span>Across all donations</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Star className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Reviews will appear here after institutes rate their donations
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {review.institute.institute_name}
                      </h3>
                      <div className="mt-1 flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-500">
                          {review.rating} out of 5
                        </span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border ${getSentimentColor(review.verdict)} flex items-center`}>
                      {getSentimentIcon(review.verdict)}
                      <span className="ml-1.5 text-sm font-medium">{review.verdict}</span>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mt-4">
                    <p className="text-gray-600">{review.comment}</p>
                  </div>

                  {/* Donation Details */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Package className="mr-1.5 h-5 w-5 text-gray-400" />
                      <span>Donation Items:</span>
                      <span className="ml-2">
                        {review.donation.items.map(item => 
                          `${item.name} (${item.quantity}${item.unit})`
                        ).join(', ')}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <Calendar className="mr-1.5 h-5 w-5 text-gray-400" />
                      <span>Reviewed on {format(new Date(review.createdAt), 'PPP')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperReviews; 