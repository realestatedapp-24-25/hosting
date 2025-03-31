import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const DonationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createDonation = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const shop = params.get('shop');
        const institute = params.get('institute');
        const amount = params.get('amount');
        const items = params.get('items');

        if (!shop || !institute || !amount || !items) {
          toast.error('Missing donation parameters');
          navigate('/profile/my-donations');
          return;
        }

        // Create donation
        await axios.get(`/api/v1/payment/donation`, {
          params: { shop, institute, amount, items },
          withCredentials: true
        });

        // Show success message
        toast.success('Donation processed successfully!');

        // Clear URL parameters and redirect to donations page
        setTimeout(() => {
          navigate('/profile/my-donations', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('Error creating donation:', error);
        toast.error(error.response?.data?.message || 'Failed to process donation');
        setTimeout(() => {
          navigate('/profile/my-donations');
        }, 2000);
      }
    };

    createDonation();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mycol-nyanza via-white to-mycol-celadon-2 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
        </motion.div>
        <h1 className="text-2xl font-bold text-mycol-brunswick_green mb-4">
          Processing Your Donation
        </h1>
        <p className="text-gray-600 mb-6">
          Please wait while we confirm your donation. You will be redirected to your donations page shortly.
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-mycol-brunswick_green/20 rounded w-3/4 mx-auto"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default DonationSuccess; 