const cloudinary = require('../config/cloudinary');
const geolib = require('geolib');
const Shipping = require('../models/shippingModel');
const Donation = require('../models/donationModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const sharp = require('sharp');

// Multer configuration
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

exports.uploadDeliveryPhoto = upload.single('photo');

exports.resizeDeliveryPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Resize the image
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 800, height: 600, fit: 'inside' })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'delivery_proofs',
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
    req.body.photoUrl = result.secure_url;
    next();
  } catch (err) {
    return next(new AppError('Error processing image', 500));
  }
});

// shippingController.js
exports.generateDeliveryQR = async (donationId) => {
    try {
        const verificationCode = uuidv4().substring(0, 8).toUpperCase();
        
        await Shipping.create({
            donation: donationId,
            qrCode: verificationCode,
            status: 'preparing'
        });

        return { verificationCode };
    } catch (error) {
        console.error('QR Generation Error:', error);
        throw error; // Propagate the error to be caught by the caller
    }
};

exports.generateDeliveryCode = async (donationId) => {
    try {
        // Generate a simple random number as the verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

        await Shipping.create({
            donation: donationId,
            qrCode: verificationCode, // Store the verification code here
            status: 'preparing'
        });

        console.log('Verification Code generated:', verificationCode);
        return { verificationCode };
    } catch (error) {
        console.error('Verification Code Generation Error:', error);
        throw error;
    }
};

exports.verifyDelivery = catchAsync(async (req, res, next) => {
    const { latitude, longitude } = req.body;
    const { code } = req.params;

    if (!req.body.photoUrl) {
        return next(new AppError('Please provide a delivery photo', 400));
    }

    // Find shipping record using the code
    const shipping = await Shipping.findOne({ qrCode: code.toUpperCase() })
        .populate({
            path: 'donation',
            populate: [
                { path: 'institute', select: 'institute_name geolocation' },
                { path: 'shop', select: 'shopName user' }
            ]
        });

    if (!shipping) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid verification code'
        });
    }

    // Check if already delivered
    if (shipping.status === 'delivered') {
        return res.status(400).json({
            status: 'error',
            message: 'This delivery has already been verified'
        });
    }

    // Verify shopkeeper
    if (shipping.donation.shop.user.toString() !== req.user.id) {
        return res.status(403).json({
            status: 'error',
            message: 'You are not authorized to verify this delivery'
        });
    }

    // Verify location - Temporarily disabled
    const instituteCoords = shipping.donation.institute.geolocation.coordinates;
    const isValidLocation = geolib.isPointWithinRadius(
        { latitude, longitude },
        { latitude: instituteCoords[1], longitude: instituteCoords[0] },
        120
    );

    if (!isValidLocation) {
        return res.status(400).json({
            status: 'error',
            message: 'Delivery must be verified within 120 meters of the institute'
        });
    }

    // Update shipping record with photo and location
    shipping.status = 'delivered';
    shipping.deliveryProof = {
        photo: req.body.photoUrl,
        coordinates: [longitude, latitude],
        timestamp: Date.now()
    };
    await shipping.save();

    // Update donation status
    await Donation.findByIdAndUpdate(shipping.donation._id, { status: 'completed' });

    res.status(200).json({
        status: 'success',
        message: 'Delivery verified successfully',
        data: {
            shipping,
            instituteName: shipping.donation.institute.institute_name
        }
    });
});

// Optional: Get delivery status
exports.getDeliveryStatus = catchAsync(async (req, res, next) => {
    const { code } = req.params;

    const shipping = await Shipping.findOne({ 
        qrCode: code.toUpperCase() 
    }).populate({
        path: 'donation',
        select: 'items totalAmount status',
        populate: [
            { 
                path: 'institute',
                select: 'institute_name' 
            },
            { 
                path: 'shop',
                select: 'shopName' 
            }
        ]
    });

    if (!shipping) {
        return next(new AppError('Invalid verification code', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            status: shipping.status,
            donation: shipping.donation
        }
    });
}); 