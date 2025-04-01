const Donor = require('../models/donorModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Shop = require('../models/shopModel');
const Institute = require('../models/instituteModel');
const Request = require('../models/requestModel');
const Donation = require('../models/donationModel');
const Email = require('../utils/email');
const QRCode = require('qrcode');
const shippingController = require('../controllers/shippingController');

// Create a new donor
exports.createDonor = catchAsync(async (req, res, next) => {
    const donor = await Donor.create({
        user: req.user.id,
        total_donations: req.body.total_donations,
        last_donation_date: req.body.last_donation_date
    });

    res.status(201).json({
        status: 'success',
        data: { donor }
    });
});

// Get all donors
exports.getAllDonors = catchAsync(async (req, res, next) => {
    const donors = await Donor.find();
    res.status(200).json({
        status: 'success',
        results: donors.length,
        data: { donors }
    });
});

// Get a single donor
exports.getDonor = catchAsync(async (req, res, next) => {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
        return next(new AppError('No donor found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { donor }
    });
});

// Update a donor
exports.updateDonor = catchAsync(async (req, res, next) => {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!donor) {
        return next(new AppError('No donor found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { donor }
    });
});

// Delete a donor
exports.deleteDonor = catchAsync(async (req, res, next) => {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
        return next(new AppError('No donor found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getShopsNearInstitute = catchAsync(async (req, res, next) => {
    // 1) Get institute with all fields and populate user
    const institute = await Institute.findById(req.params.id)
        .populate('user');

    if (!institute) {
        return next(new AppError('No institute found with that ID', 404));
    }

    // 2) Convert radius to number (default 500 meters)
    const radius = req.query.radius ? Number(req.query.radius) : 500;

    // Validate radius input
    if (isNaN(radius) || radius < 0) {
        return next(new AppError('Invalid radius value', 400));
    }

    // 3) Find shops using geospatial query with all fields
    const shops = await Shop.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: institute.geolocation.coordinates
                },
                distanceField: "distance",
                maxDistance: radius,
                spherical: true
            }
        },
        {
            $match: {
                verificationStatus: true
            }
        }
    ]);

    // 4) Populate user details for shops
    const populatedShops = await Shop.populate(shops, [
        { path: 'user' }
    ]);

    // 5) Handle no shops found
    if (populatedShops.length === 0) {
        return res.status(404).json({
            status: 'fail',
            message: `No verified shops found within ${radius}m radius`
        });
    }

    // 6) Format response with exact meter distances but keep all other fields
    const response = populatedShops.map(shop => ({
        ...shop,
        distance: Math.round(shop.distance) // Round to nearest meter
    }));

    res.status(200).json({
        status: 'success',
        results: response.length,
        data: {
            radius: radius,
            institute, // Send complete institute object
            shops: response // Send complete shop objects
        }
    });
});

exports.getShopsWithRequestedItems = catchAsync(async (req, res, next) => {
    // 1) Get institute and its request
    const institute = await Institute.findById(req.params.instituteId);
    if (!institute) {
        return next(new AppError('No institute found with that ID', 404));
    }

    const request = await Request.findOne({ institute: institute._id, status: 'pending' });
    if (!request) {
        return next(new AppError('No pending request found for this institute', 404));
    }

    // 2) Convert radius to number (default 500 meters)
    const radius = req.query.radius ? Number(req.query.radius) : 500;

    // Validate radius input
    if (isNaN(radius) || radius < 0) {
        return next(new AppError('Invalid radius value', 400));
    }

    // 3) Find shops using geospatial query
    const shops = await Shop.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: institute.geolocation.coordinates
                },
                distanceField: "distance",
                maxDistance: radius,
                spherical: true
            }
        },
        {
            $match: {
                verificationStatus: true
            }
        }
    ]);

    // 4) Check which shops have the requested items
    const matchingShops = shops.filter(shop => {
        return request.items.some(requestedItem => {
            return shop.inventory.some(inventoryItem => {
                return inventoryItem.itemName === requestedItem.name && inventoryItem.quantity >= requestedItem.quantity;
            });
        });
    });

    // 5) Handle no matching shops found
    if (matchingShops.length === 0) {
        return res.status(404).json({
            status: 'fail',
            message: 'No shops found with the requested items within the specified radius'
        });
    }

    // 6) Format response
    const response = matchingShops.map(shop => ({
        shopName: shop.shopName,
        distance: Math.round(shop.distance), // Round to nearest meter
        inventory: shop.inventory,
        contactInfo: shop.contactInfo,
        rating: shop.rating
    }));

    res.status(200).json({
        status: 'success',
        results: response.length,
        data: {
            radius: radius,
            institute: institute._id,
            shops: response
        }
    });
});

exports.createDonation = catchAsync(async (req, res, next) => {
    const { shopId, items } = req.body;
    const instituteId = req.params.instituteId;

    // Add validation
    if (!shopId || !items || !Array.isArray(items) || items.length === 0) {
        return next(new AppError('Invalid donation data', 400));
    }

    // Find shop and validate
    const shop = await Shop.findById(shopId).populate('user');
    if (!shop) return next(new AppError('Shop not found', 404));

    // Find institute and validate
    const institute = await Institute.findById(instituteId).populate('user');
    if (!institute) return next(new AppError('Institute not found', 404));

    // Find active request
    const request = await Request.findOne({ 
        institute: instituteId, 
        status: { $in: ['pending', 'partially fulfilled'] } 
    });
    if (!request) return next(new AppError('No pending or partially fulfilled request found for this institute', 404));

    let totalAmount = 0;
    const fulfilledItems = [];

    // Validate items and calculate total
    for (const item of items) {
        const shopItem = shop.inventory.find(i => i.itemName === item.name);
        if (!shopItem) {
            return next(new AppError(`Item ${item.name} not found in shop inventory`, 400));
        }
        if (shopItem.quantity < item.quantity) {
            return next(new AppError(`Insufficient stock for ${item.name}`, 400));
        }
        totalAmount += shopItem.pricePerUnit * item.quantity;
        fulfilledItems.push({ 
            name: item.name, 
            quantity: item.quantity, 
            unit: item.unit 
        });
    }

    // Create donation
    const donation = await Donation.create({
        donor: req.user.id,
        institute: instituteId,
        shop: shopId,
        items: fulfilledItems,
        totalAmount
    });

    // Update shop inventory
    for (const item of items) {
        await Shop.findOneAndUpdate(
            { 
                _id: shopId,
                'inventory.itemName': item.name
            },
            {
                $inc: { 'inventory.$.quantity': -item.quantity }
            },
            { new: true }
        );
    }

    // Update request status and fulfillment details
    const remainingItems = request.items.map(reqItem => {
        const fulfilledItem = fulfilledItems.find(item => item.name === reqItem.name);
        if (fulfilledItem) {
            reqItem.quantity -= fulfilledItem.quantity;
            if (reqItem.quantity < 0) reqItem.quantity = 0;
        }
        return reqItem;
    });

    const requestStatus = remainingItems.some(item => item.quantity > 0) ? 'partially fulfilled' : 'fulfilled';

    await Request.findByIdAndUpdate(request._id, {
        status: requestStatus,
        items: remainingItems,
        $addToSet: {
            'fulfillmentDetails.shops': shopId,
            'fulfillmentDetails.donors': req.user.id
        }
    });

    try {
        // Generate verification code
        const result = await shippingController.generateDeliveryCode(donation._id);
        if (!result || !result.verificationCode) {
            throw new Error('Failed to retrieve verification code');
        }
        const verificationCode = result.verificationCode;
        console.log('Verification code generation successful');

        // Send email to institute with verification code
        await new Email(institute.user, {
            instituteName: institute.institute_name,
            items: fulfilledItems,
            totalAmount,
            verificationCode
        }).sendDonationNotificationWithQR();

        // Send email to shop
        await new Email(shop.user, {
            shopName: shop.shopName,
            instituteName: institute.institute_name,
            instituteAddress: institute.user.address,
            items: fulfilledItems,
            totalAmount
        }).sendShopDeliveryNotification();

        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error in donation process:', error.message);
    }

    res.status(201).json({
        status: 'success',
        data: { donation }
    });
});

// Get nearby shops for an institute
exports.getNearbyShops = catchAsync(async (req, res, next) => {
    const { instituteId } = req.params;
    const radius = Number(req.query.radius) || 500;

    // Get institute with all details including user
    const institute = await Institute.findById(instituteId)
        .populate('user');

    if (!institute) {
        return next(new AppError('Institute not found', 404));
    }

    // Find shops within radius
    const shops = await Shop.aggregate([
        {
            $geoNear: {
                near: institute.geolocation,
                distanceField: "distance",
                maxDistance: radius,
                spherical: true,
                query: { verificationStatus: true }
            }
        }
    ]);

    // Populate all details for each shop
    const populatedShops = await Shop.populate(shops, [
        { path: 'user' }
    ]);

    if (!populatedShops.length) {
        return next(new AppError(`No verified shops found within ${radius}m radius`, 404));
    }

    res.status(200).json({
        status: 'success',
        results: populatedShops.length,
        data: {
            radius,
            institute,
            shops: populatedShops
        }
    });
});

exports.getMyDonations = catchAsync(async (req, res, next) => {
    const donations = await Donation.find({ donor: req.user.id })
        .populate({
            path: 'institute',
            select: 'institute_name user',
            populate: {
                path: 'user',
                select: 'address contactInfo'
            }
        })
        .populate({
            path: 'shop',
            select: 'shopName contactInfo'
        })
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        data: {
            donations
        }
    });
});

exports.getShopDonations = catchAsync(async (req, res, next) => {
    // Find the shop associated with the logged-in user
    const shop = await Shop.findOne({ user: req.user.id });

    if (!shop) {
        return next(new AppError('No shop found for this user', 404));
    }

    // Find all donations sent to this shop
    const donations = await Donation.find({ shop: shop._id })
        .sort('-createdAt') // Sort by newest first
        .populate('items.item', 'name unit') // Populate item details
        .populate('donor', 'name email'); // Populate donor details

    res.status(200).json({
        status: 'success',
        results: donations.length,
        data: {
            donations
        }
    });
});

exports.getInstituteDonations = catchAsync(async (req, res, next) => {
    // Find the institute associated with the logged-in user
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
        return next(new AppError('No institute found for this user', 404));
    }

    // Fetch donations related to the institute
    const donations = await Donation.find({ institute: institute._id })
        .populate('shop', 'shopName')
        .sort('-createdAt'); // Sort by newest first

    res.status(200).json({
        status: 'success',
        results: donations.length,
        data: {
            donations
        }
    });
});