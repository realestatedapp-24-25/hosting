import React, { useState } from 'react';
import ReviewForm from './ReviewForm';

const InstituteReviews = () => {
  const [showReviewForm, setShowReviewForm] = useState(true);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    // Optionally refresh the list of reviews
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Submit a Review</h1>
      {showReviewForm && (
        <ReviewForm
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
};

export default InstituteReviews; 