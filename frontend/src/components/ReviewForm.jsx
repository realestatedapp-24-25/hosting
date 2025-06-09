// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Star, Send, AlertCircle } from 'lucide-react';
// import toast from 'react-hot-toast';

// const ReviewForm = ({ onSuccess, onCancel }) => {
//   const [donations, setDonations] = useState([]);
//   const [selectedDonation, setSelectedDonation] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [comment, setComment] = useState('');
//   const [hoveredRating, setHoveredRating] = useState(0);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchDonations = async () => {
//       try {
//         const response = await axios.get('/api/v1/donors/institute-donations', {
//           withCredentials: true
//         });
//         setDonations(response.data.data.donations);
//       } catch (error) {
//         console.error('Fetch donations error:', error);
//         toast.error('Failed to fetch donations');
//       }
//     };

//     fetchDonations();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedDonation) {
//       toast.error('Please select a donation');
//       return;
//     }

//     if (rating === 0) {
//       toast.error('Please select a rating');
//       return;
//     }

//     if (comment.trim().length < 10) {
//       toast.error('Please provide a comment with at least 10 characters');
//       return;
//     }

//     const reviewData = {
//       rating,
//       comment,
//       shopId: selectedDonation.shop._id,
//       donationId: selectedDonation._id
//     };

//     console.log('Submitting review:', reviewData);

//     try {
//       setLoading(true);
//       const response = await axios.post('/api/v1/reviews', reviewData, {
//         withCredentials: true,
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });

//       console.log('Review submission response:', response.data);
//       toast.success('Review submitted successfully!');
//       if (onSuccess) onSuccess();
//     } catch (error) {
//       console.error('Review submission error:', error);
//       if (error.response) {
//         console.error('Error response:', error.response.data);
//         toast.error(error.response.data.message || 'Failed to submit review');
//       } else if (error.request) {
//         console.error('No response received:', error.request);
//         toast.error('No response received from server. Check your connection.');
//       } else {
//         console.error('Error setting up request:', error.message);
//         toast.error('Error setting up the request: ' + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex">
//       <div className="w-1/3 p-4 bg-gray-100 rounded-lg">
//         <h3 className="text-lg font-semibold mb-2">Select a Donation</h3>
//         {donations.length === 0 && (
//           <p className="text-gray-500 italic">No donations found</p>
//         )}
//         <ul className="space-y-2">
//           {donations.map((donation) => (
//             <li
//               key={donation._id}
//               className={`p-2 cursor-pointer rounded-lg ${selectedDonation?._id === donation._id ? 'bg-blue-200' : 'bg-white'}`}
//               onClick={() => setSelectedDonation(donation)}
//             >
//               {donation.items.map(item => item.name).join(', ')} - {donation.shop.shopName}
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div className="w-2/3 p-6 bg-white rounded-xl shadow-lg ml-4">
//         <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit a Review</h2>

//         {selectedDonation && (
//           <p className="mb-4 text-gray-600">
//             Reviewing donation for: <span className="font-medium">{selectedDonation.shop.shopName}</span>
//           </p>
//         )}

//         <div className="flex items-center justify-center space-x-2 mb-6">
//           {[1, 2, 3, 4, 5].map((star) => (
//             <button
//               key={star}
//               type="button"
//               onMouseEnter={() => setHoveredRating(star)}
//               onMouseLeave={() => setHoveredRating(0)}
//               onClick={() => setRating(star)}
//               className="focus:outline-none transition-colors"
//             >
//               <Star
//                 className={`h-8 w-8 ${
//                   star <= (hoveredRating || rating)
//                     ? 'fill-yellow-400 text-yellow-400'
//                     : 'text-gray-300'
//                 }`}
//               />
//             </button>
//           ))}
//         </div>

//         <div className="mb-6">
//           <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
//             Your Review
//           </label>
//           <textarea
//             id="comment"
//             rows={4}
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mycol-mint focus:border-mycol-mint"
//             placeholder="Tell us about your experience..."
//           />
//           <p className="text-sm text-gray-500 mt-1">
//             {comment.trim().length}/10 characters minimum
//           </p>
//         </div>

//         <div className="flex justify-end space-x-4">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="flex items-center space-x-2 px-6 py-2 bg-mycol-mint text-white rounded-lg hover:bg-mycol-sea_green transition-colors disabled:bg-gray-400"
//           >
//             {loading ? (
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
//             ) : (
//               <>
//                 <Send className="h-5 w-5" />
//                 <span>Submit Review</span>
//               </>
//             )}
//           </button>
//         </div>

//         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
//           <div className="flex items-start space-x-2">
//             <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
//             <div className="text-sm text-gray-600">
//               <p className="font-medium mb-1">Review Guidelines:</p>
//               <ul className="list-disc list-inside space-y-1">
//                 <li>Be honest and specific about your experience</li>
//                 <li>Keep it professional and constructive</li>
//                 <li>Minimum 10 characters required for the review</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReviewForm;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Send, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReviewForm = ({ onSuccess, onCancel }) => {
  const [donations, setDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/donors/institute-donations', {
        withCredentials: true
      });
      
      if (response.data && response.data.status === 'success' && response.data.data.donations) {
        setDonations(response.data.data.donations);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to load donations. Please try again later.');
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSelect = (donation) => {
    setSelectedDonation(donation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    if (!selectedDonation) {
      toast.error('Please select a donation');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Please provide a comment with at least 10 characters');
      return;
    }

    // Prepare review data
    const reviewData = {
      rating,
      comment,
      shopId: selectedDonation.shop._id,
      donationId: selectedDonation._id
    };

    console.log('Submitting review:', reviewData);
    
    // Submit review
    try {
      setLoading(true);
      const response = await axios.post('/api/v1/reviews', reviewData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Review submission response:', response.data);
      toast.success('Review submitted successfully!');
      
      // Reset form
      setSelectedDonation(null);
      setRating(0);
      setComment('');
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Review submission error:', error);
      
      // Detailed error handling
      if (error.response) {
        const errorMessage = error.response.data.message || 'Failed to submit review';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('No response received from server. Please check your connection.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Render donation item details
  const renderDonationItems = (items) => {
    if (!items || items.length === 0) return 'No items';
    
    return items.map(item => 
      `${item.name} (${item.quantity} ${item.unit})`
    ).join(', ');
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-4">
      {/* Donation Selection Panel */}
      <div className="w-full md:w-1/3 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Select a Donation</h3>
        
        {loading && donations.length === 0 ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 inline mr-2" />
            {error}
            <button 
              onClick={fetchDonations}
              className="mt-2 text-blue-500 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : donations.length === 0 ? (
          <p className="text-gray-500 italic p-2">No donations found</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <ul className="space-y-2">
              {donations.map((donation) => (
                <li
                  key={donation._id}
                  className={`p-3 cursor-pointer rounded-lg transition-colors ${
                    selectedDonation?._id === donation._id ? 'bg-blue-200 border-l-4 border-blue-500' : 'bg-white hover:bg-blue-50'
                  }`}
                  onClick={() => handleDonationSelect(donation)}
                >
                  <div className="font-medium">{donation.shop.shopName}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {renderDonationItems(donation.items)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Amount: ${donation.totalAmount} • Status: {donation.status}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Review Form Panel */}
      <div className="w-full md:w-2/3 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Submit a Review</h2>

        {selectedDonation ? (
          <div className="mb-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-gray-800">
              Reviewing donation for: <span className="font-medium">{selectedDonation.shop.shopName}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Items: {renderDonationItems(selectedDonation.items)}
            </p>
          </div>
        ) : (
          <p className="mb-6 text-gray-500 italic">Please select a donation from the list</p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-colors"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select a rating'}
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about your experience..."
              disabled={loading}
            />
            <div className="flex justify-between text-sm mt-1">
              <p className={`${comment.trim().length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                {comment.trim().length} / 10 characters minimum
              </p>
              {comment.trim().length < 10 && comment.trim().length > 0 && (
                <p className="text-orange-500">
                  Please add {10 - comment.trim().length} more characters
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedDonation || rating === 0 || comment.trim().length < 10}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Guidelines Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Review Guidelines:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Be honest and specific about your experience</li>
                <li>Keep it professional and constructive</li>
                <li>Minimum 10 characters required for the review</li>
                <li>Your review helps improve service quality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;