const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Request = require('../models/requestModel');
const Institute = require('../models/instituteModel');
const Shop = require('../models/shopModel');
const User = require('../models/userModel');
const checkAnomaly = require('../utils/anomalyDetection');
const Email = require('../utils/email');
const mongoose = require('mongoose');

const sendAnomalyAlert = async (institute, requestCount) => {
    try {
        // Use static admin email
        const admin = await User.findOne({ 
            email: 'sharvariborse03@gmail.com',
            role: 'admin' 
        });

        if (!admin) {
            console.error('Admin not found for anomaly alert');
            return;
        }

        await new Email(admin, {
            instituteName: institute.institute_name,
            instituteEmail: institute.user.email,
            institutePerson: institute.user.name,
            requestCount: requestCount,
            daysCount: 5,
            warningThreshold: 15,
            attemptTime: new Date().toLocaleString(),
            url: `${process.env.FRONTEND_URL}/requests` // Add your frontend URL
        }).sendAnomalyAlert();

        console.log(`Anomaly alert sent to admin (${admin.email}) for institute ${institute.institute_name}`);
    } catch (error) {
        console.error('Error sending anomaly alert:', error);
    }
};

const checkRequestLimit = async (instituteId) => {
    const currentDate = new Date();
    const fiveDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 5));

    // Count requests in the last 5 days
    const requestCount = await Request.aggregate([
        {
            $match: {
                institute: instituteId,
                createdAt: { $gte: fiveDaysAgo }
            }
        },
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ]);

    return requestCount.length > 0 ? requestCount[0].count : 0;
};

// Create a new request
// Create a new request (for institutes)
exports.createRequest = catchAsync(async (req, res, next) => {
    // 1) Check if user is an institute
    if (req.user.role !== 'institute') {
        return next(new AppError('Only institutes can create requests', 403));
    }

    // 2) Find institute associated with the user
    const institute = await Institute.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!institute) {
        return next(new AppError('No institute found for this user', 404));
    }

    // 3) Check request limit
    const requestCount = await checkRequestLimit(institute._id);
    if (requestCount >= 15) {
        // Always send alert when limit is exceeded
        await sendAnomalyAlert(institute, requestCount);

        return next(
            new AppError(
                `Request limit exceeded. You have made ${requestCount} requests in the last 5 days. Please try again later.`,
                429
            )
        );
    }

    // 4) Create request if limit not exceeded
    const { items, category, priority, comments } = req.body;
    
    const newRequest = await Request.create({
        institute: institute._id,
        items,
        category,
        priority,
        comments
    });

    // 5) Check for anomalies and send notification
    if (requestCount + 1 >= 15) {
        await checkAnomaly(institute._id);
    }

    // 6) Populate institute details in response
    await newRequest.populate({
        path: 'institute',
        select: 'name description institute_type geolocation contactInfo'
    });

    res.status(201).json({
        status: 'success',
        data: {
            request: newRequest
        }
    });
});

// Get all requests
exports.getAllRequests = catchAsync(async (req, res, next) => {
    const requests = await Request.find()
        .populate({
            path: 'institute',
            select: 'name description institute_type geolocation contactInfo institute_name',
            populate: {
                path: 'user',
                select: 'name email'
            }
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: requests.length,
        data: {
            requests
        }
    });
});

// Get a single request
exports.getRequest = catchAsync(async (req, res, next) => {
    const request = await Request.findById(req.params.id)
        .populate({
            path: 'institute',
            select: 'institute_name institute_type description geolocation verification_status',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });

    if (!request) {
        return next(new AppError('No request found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            request
        }
    });
});

// Get a single request with nearby shops
exports.getRequestWithShops = catchAsync(async (req, res, next) => {
    const request = await Request.findById(req.params.id)
        .populate({
            path: 'institute',
            select: 'institute_name institute_type description geolocation verification_status',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });

    if (!request) {
        return next(new AppError('No request found with that ID', 404));
    }

    // Find shops within 10km radius of the institute
    const shops = await Shop.aggregate([
        {
            $geoNear: {
                near: request.institute.geolocation,
                distanceField: "distance",
                maxDistance: 10000, // 10km in meters
                spherical: true,
                query: { verification_status: true }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                geolocation: 1,
                contact_info: 1,
                distance: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            request,
            nearbyShops: shops
        }
    });
});

exports.searchRequests = catchAsync(async (req, res, next) => {
    const {
        institute_type,    // ORPHANAGE, OLD_AGE_HOME, etc.
        institute_name,    // Name of the institute
        category,         // Type of items needed
        status,          // Request status
        page = 1,
        limit = 10
    } = req.query;

    // Build the aggregation pipeline
    const pipeline = [];

    // First, lookup institute details
    pipeline.push({
        $lookup: {
            from: 'institutes',
            localField: 'institute',
            foreignField: '_id',
            as: 'institute_details'
        }
    });

    // Unwind the institute_details array
    pipeline.push({
        $unwind: '$institute_details'
    });

    // Match stage for filtering
    const matchStage = {};

    // Filter by institute type
    if (institute_type) {
        matchStage['institute_details.institute_type'] = institute_type.toUpperCase();
    }

    // Filter by institute name (case-insensitive partial match)
    if (institute_name) {
        matchStage['institute_details.institute_name'] = {
            $regex: institute_name,
            $options: 'i'
        };
    }

    // Filter by request status
    if (status) {
        matchStage.status = status.toLowerCase();
    }

    // Filter by item category (search in items array)
    if (category) {
        matchStage['items.name'] = {
            $regex: category,
            $options: 'i'
        };
    }

    // Add match stage to pipeline if there are any filters
    if (Object.keys(matchStage).length > 0) {
        pipeline.push({
            $match: matchStage
        });
    }

    // Add sorting by creation date
    pipeline.push({
        $sort: { createdAt: -1 }
    });

    // Get total count before pagination
    const countPipeline = [...pipeline];
    countPipeline.push({
        $count: 'total'
    });

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Add final project stage to shape the output
    pipeline.push({
        $project: {
            _id: 1,
            items: 1,
            status: 1,
            urgency: 1,
            priority: 1,
            category: 1,
            comments: 1,
            fulfillmentDetails: 1,
            createdAt: 1,
            institute: {
                $cond: {
                    if: { $eq: ["$institute", null] },
                    then: null,
                    else: {
                        _id: '$institute_details._id',
                        institute_name: '$institute_details.institute_name',
                        institute_type: '$institute_details.institute_type',
                        user: '$institute_details.user',
                        geolocation: '$institute_details.geolocation'
                    }
                }
            }
        }
    });

    // Execute the aggregation
    const [requests, [countResult]] = await Promise.all([
        Request.aggregate(pipeline),
        Request.aggregate(countPipeline)
    ]);

    // Populate user details for each institute
    await Request.populate(requests, {
        path: 'institute.user',
        select: 'name email address'
    });

    res.status(200).json({
        status: 'success',
        results: requests.length,
        total: countResult ? countResult.total : 0,
        totalPages: countResult ? Math.ceil(countResult.total / limit) : 0,
        currentPage: parseInt(page),
        data: {
            requests
        }
    });
});
exports.getMyRequests = catchAsync(async (req, res, next) => {
    // 1) Find the institute associated with the logged-in user
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
        return next(new AppError('No institute found for this user', 404));
    }

    // 2) Find all requests made by this institute
    const requests = await Request.find({ institute: institute._id })
        .populate({
            path: 'institute',
            populate: { path: 'user', select: 'name email address' }
        });

    // 3) Send the response
    res.status(200).json({
        status: 'success',
        results: requests.length,
        data: {
            requests
        }
    });
});