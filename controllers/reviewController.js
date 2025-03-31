// const Review = require('../models/reviewModel');
// const Donation = require('../models/donationModel');
// const Institute = require('../models/instituteModel');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

// exports.createReview = catchAsync(async (req, res, next) => {
//     const { rating, comment, shopId, donationId } = req.body;

//     // Find the institute associated with the logged-in user
//     const institute = await Institute.findOne({ user: req.user.id });

//     if (!institute) {
//         return next(new AppError('No institute found for this user', 404));
//     }

//     // Check if donation exists and belongs to the institute
//     const donation = await Donation.findOne({
//         _id: donationId,
//         institute: institute._id,
//         shop: shopId,
//     });

//     if (!donation) {
//         return next(new AppError('No completed donation found with this ID for your institute', 404));
//     }

//     // Check if review already exists
//     const existingReview = await Review.findOne({
//         institute: institute._id,
//         donation: donationId
//     });

//     if (existingReview) {
//         return next(new AppError('You have already reviewed this donation', 400));
//     }

//     // Create review
//     const review = await Review.create({
//         institute: institute._id,
//         shop: shopId,
//         rating,
//         comment,
//         donation: donationId
//     });

//     res.status(201).json({
//         status: 'success',
//         data: {
//             review
//         }
//     });
// });

// exports.getShopReviews = catchAsync(async (req, res, next) => {
//     const { shopId } = req.params;

//     const reviews = await Review.find({ shop: shopId })
//         .populate({
//             path: 'institute',
//             select: 'institute_name'
//         })
//         .populate({
//             path: 'donation',
//             select: 'items totalAmount createdAt'
//         })
//         .sort('-createdAt');

//     res.status(200).json({
//         status: 'success',
//         results: reviews.length,
//         data: {
//             reviews
//         }
//     });
// });

// exports.updateReview = catchAsync(async (req, res, next) => {
//     const { rating, comment } = req.body;
//     const { reviewId } = req.params;

//     // Find the institute associated with the logged-in user
//     const institute = await Institute.findOne({ user: req.user.id });

//     if (!institute) {
//         return next(new AppError('No institute found for this user', 404));
//     }

//     const review = await Review.findOne({
//         _id: reviewId,
//         institute: institute._id
//     });

//     if (!review) {
//         return next(new AppError('Review not found or not authorized', 404));
//     }

//     review.rating = rating || review.rating;
//     review.comment = comment || review.comment;
//     await review.save();

//     res.status(200).json({
//         status: 'success',
//         data: {
//             review
//         }
//     });
// });

// exports.deleteReview = catchAsync(async (req, res, next) => {
//     const { reviewId } = req.params;

//     // Find the institute associated with the logged-in user
//     const institute = await Institute.findOne({ user: req.user.id });

//     if (!institute) {
//         return next(new AppError('No institute found for this user', 404));
//     }

//     const review = await Review.findOne({
//         _id: reviewId,
//         institute: institute._id
//     });

//     if (!review) {
//         return next(new AppError('Review not found or not authorized', 404));
//     }

//     await review.deleteOne();

//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// }); 
const Review = require('../models/reviewModel');
const Donation = require('../models/donationModel');
const Institute = require('../models/instituteModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const axios = require('axios');
const Shop = require('../models/shopModel');
const ExcelJS = require('exceljs');

// Flask sentiment analysis API endpoint
const SENTIMENT_API_URL = 'http://localhost:5001/predict_sentiment';

exports.createReview = catchAsync(async (req, res, next) => {
    const { rating, comment, shopId, donationId } = req.body;

    // Find the institute associated with the logged-in user
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
        return next(new AppError('No institute found for this user', 404));
    }

    // Check if donation exists and belongs to the institute
    const donation = await Donation.findOne({
        _id: donationId,
        institute: institute._id,
        shop: shopId,
    });

    if (!donation) {
        return next(new AppError('No completed donation found with this ID for your institute', 404));
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
        institute: institute._id,
        donation: donationId
    });

    if (existingReview) {
        return next(new AppError('You have already reviewed this donation', 400));
    }

    // Get sentiment analysis from Flask API
    let verdict = 'Neutral'; // Default value
    try {
        const sentimentResponse = await axios.post(SENTIMENT_API_URL, {
            review: comment
        });
        
        if (sentimentResponse.data && sentimentResponse.data.status === 'success') {
            verdict = sentimentResponse.data.verdict;
            console.log('Sentiment analysis result:', verdict);
        } else {
            console.error('Invalid sentiment response:', sentimentResponse.data);
        }
    } catch (error) {
        console.error('Sentiment analysis failed:', error.response?.data || error.message);
        // Continue with default verdict if sentiment analysis fails
    }

    // Create review with verdict
    const review = await Review.create({
        institute: institute._id,
        shop: shopId,
        rating,
        comment,
        donation: donationId,
        verdict // Add the sentiment verdict
    });

    res.status(201).json({
        status: 'success',
        data: {
            review
        }
    });
});

exports.getShopReviews = catchAsync(async (req, res, next) => {
    const { shopId } = req.params;

    const reviews = await Review.find({ shop: shopId })
        .populate({
            path: 'institute',
            select: 'institute_name'
        })
        .populate({
            path: 'donation',
            select: 'items totalAmount createdAt'
        })
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.updateReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const { reviewId } = req.params;

    // Find the institute associated with the logged-in user
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
        return next(new AppError('No institute found for this user', 404));
    }

    const review = await Review.findOne({
        _id: reviewId,
        institute: institute._id
    });

    if (!review) {
        return next(new AppError('Review not found or not authorized', 404));
    }

    // Only update verdict if comment is updated
    if (comment && comment !== review.comment) {
        // Get sentiment analysis from Flask API
        try {
            const sentimentResponse = await axios.post(SENTIMENT_API_URL, {
                review: comment
            });
            
            if (sentimentResponse.data && sentimentResponse.data.verdict) {
                review.verdict = sentimentResponse.data.verdict;
            }
        } catch (error) {
            console.error('Sentiment analysis failed during update:', error.message);
            // Keep existing verdict if sentiment analysis fails
        }
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;

    // Find the institute associated with the logged-in user
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
        return next(new AppError('No institute found for this user', 404));
    }

    const review = await Review.findOne({
        _id: reviewId,
        institute: institute._id
    });

    if (!review) {
        return next(new AppError('Review not found or not authorized', 404));
    }

    await review.deleteOne();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// New endpoint to get sentiment distribution for a shop
exports.getShopSentimentStats = catchAsync(async (req, res, next) => {
    const { shopId } = req.params;

    const stats = await Review.aggregate([
        {
            $match: { shop: new mongoose.Types.ObjectId(shopId) }
        },
        {
            $group: {
                _id: '$verdict',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    // Format the stats into a more usable format
    const formattedStats = {
        Positive: 0,
        Neutral: 0,
        Negative: 0
    };

    stats.forEach(stat => {
        if (stat._id) {
            formattedStats[stat._id] = {
                count: stat.count,
                avgRating: parseFloat(stat.avgRating.toFixed(1))
            };
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            sentimentStats: formattedStats
        }
    });
});

// Get reviews for logged in shop keeper
exports.getMyShopReviews = catchAsync(async (req, res, next) => {
    // Find the shop associated with the logged-in user
    const shop = await Shop.findOne({ user: req.user.id });

    if (!shop) {
        return next(new AppError('No shop found for this user', 404));
    }

    const reviews = await Review.find({ shop: shop._id })
        .populate({
            path: 'institute',
            select: 'institute_name'
        })
        .populate({
            path: 'donation',
            select: 'items totalAmount createdAt'
        })
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

// Generate Excel sheet for reviews
exports.downloadReviewsExcel = catchAsync(async (req, res, next) => {
    const { shopId } = req.params;

    // Fetch reviews with populated data
    const reviews = await Review.find({ shop: shopId })
        .populate({
            path: 'institute',
            select: 'institute_name'
        })
        .sort('-createdAt');

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reviews');

    // Define columns
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Institute Name', key: 'instituteName', width: 30 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Review', key: 'comment', width: 50 },
        { header: 'Sentiment', key: 'verdict', width: 15 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data to worksheet
    reviews.forEach(review => {
        worksheet.addRow({
            date: new Date(review.createdAt).toLocaleDateString(),
            instituteName: review.institute ? review.institute.institute_name : 'N/A',
            rating: review.rating,
            comment: review.comment,
            verdict: review.verdict
        });
    });

    // Auto filter
    worksheet.autoFilter = {
        from: 'A1',
        to: 'E1'
    };

    // Set response headers
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=reviews.xlsx'
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
});

// Download Excel for logged-in shop's reviews
exports.downloadMyShopReviews = catchAsync(async (req, res, next) => {
    // Find the shop associated with the logged-in user
    const shop = await Shop.findOne({ user: req.user.id });

    if (!shop) {
        return next(new AppError('No shop found for this user', 404));
    }

    // Fetch reviews with populated data
    const reviews = await Review.find({ shop: shop._id })
        .populate({
            path: 'institute',
            select: 'institute_name'
        })
        .sort('-createdAt');

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reviews');

    // Define columns
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Institute Name', key: 'instituteName', width: 30 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Review', key: 'comment', width: 50 },
        { header: 'Sentiment', key: 'verdict', width: 15 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data to worksheet
    reviews.forEach(review => {
        worksheet.addRow({
            date: new Date(review.createdAt).toLocaleDateString(),
            instituteName: review.institute ? review.institute.institute_name : 'N/A',
            rating: review.rating,
            comment: review.comment,
            verdict: review.verdict
        });
    });

    // Auto filter
    worksheet.autoFilter = {
        from: 'A1',
        to: 'E1'
    };

    // Set response headers
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=my-shop-reviews.xlsx'
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
});