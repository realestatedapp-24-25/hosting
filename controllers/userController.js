const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const Donation = require('../models/donationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Resize the image
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 500, height: 500, fit: 'cover' })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'user_photos',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(resizedImageBuffer);
    });

    // Add the photo URL to the request body
    req.body.photo = result.secure_url;
    next();
  } catch (err) {
    return next(new AppError('Error processing image', 500));
  }
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
  }

  // 2) Filter unwanted fields
  const filteredBody = filterObj(req.body, 'name', 'email', 'address', 'photo');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.getDashboardData = catchAsync(async (req, res, next) => {
  // Get user's donations
  const donations = await Donation.find({ donor: req.user.id })
    .sort('-createdAt')
    .limit(10);

  // Calculate statistics
  const allDonations = await Donation.find({ donor: req.user.id });
  const stats = {
    totalDonations: allDonations.length,
    pendingDonations: allDonations.filter(d => d.status === 'pending').length,
    successfulDonations: allDonations.filter(d => d.status === 'completed').length,
    impactScore: calculateImpactScore(allDonations)
  };

  // Format recent activity
  const recentActivity = donations.map(donation => ({
    type: 'donation',
    description: `Donated ${donation.items.length} items to ${donation.institute.name}`,
    status: donation.status,
    timestamp: donation.createdAt,
    amount: donation.totalAmount
  }));

  res.status(200).json({
    status: 'success',
    data: {
      stats,
      recentActivity
    }
  });
});

// Helper function to calculate impact score
const calculateImpactScore = (donations) => {
  let score = 0;
  
  donations.forEach(donation => {
    // Base points for each donation
    score += 10;
    
    // Additional points based on donation amount
    score += Math.floor(donation.totalAmount / 100);
    
    // Bonus points for completed donations
    if (donation.status === 'completed') {
      score += 20;
    }
    
    // Points for each item donated
    score += donation.items.length * 5;
  });
  
  return score;
}; 