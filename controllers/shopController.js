const Shop = require('../models/shopModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Donation = require('../models/donorModel');
const Shipping = require('../models/shippingModel');

// Create a new shop
exports.createShop = catchAsync(async (req, res, next) => {
    const shop = await Shop.create({
        user: req.user.id,
        name: req.body.shopName,
        shopName: req.body.shopName,
        location: req.body.location,
        verificationStatus: req.body.verificationStatus,
        inventory: req.body.inventory,
        contactInfo: req.body.contactInfo
    });

    res.status(201).json({
        status: 'success',
        data: { shop }
    });
});

// Get all shops
exports.getAllShops = catchAsync(async (req, res, next) => {
    const shops = await Shop.find();
    res.status(200).json({
        status: 'success',
        results: shops.length,
        data: { shops }
    });
});

// Get a single shop
exports.getShop = catchAsync(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
        return next(new AppError('No shop found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { shop }
    });
});

// Update a shop
exports.updateShop = catchAsync(async (req, res, next) => {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!shop) {
        return next(new AppError('No shop found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { shop }
    });
});

// Delete a shop
exports.deleteShop = catchAsync(async (req, res, next) => {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) {
        return next(new AppError('No shop found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getNearbyShops = catchAsync(async (req, res, next) => {
    const { latitude, longitude, distance } = req.query;

    if (!latitude || !longitude || !distance) {
        return next(new AppError('Please provide latitude, longitude, and distance', 400));
    }

    const radius = distance / 6378.1; // Convert distance to radians (Earth's radius in km)

    // First get all shops within the radius
    const shops = await Shop.find({
        location: {
            $geoWithin: {
                $centerSphere: [[longitude, latitude], radius]
            }
        }
    });

    if (!shops.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'No stores found within the specified radius'
        });
    }

    // Get the latest donation for each shop
    const shopDonations = await Donation.aggregate([
        {
            $match: {
                shop: { $in: shops.map(shop => shop._id) }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: '$shop',
                lastDonationDate: { $first: '$createdAt' }
            }
        }
    ]);

    // Create a map of shop ID to last donation date
    const shopDonationMap = new Map(
        shopDonations.map(item => [item._id.toString(), item.lastDonationDate])
    );

    // Sort shops: shops with no donations first, then by oldest donation
    const sortedShops = [...shops].sort((a, b) => {
        const aDate = shopDonationMap.get(a._id.toString());
        const bDate = shopDonationMap.get(b._id.toString());
        
        if (!aDate && !bDate) return 0;
        if (!aDate) return -1;
        if (!bDate) return 1;
        return aDate - bDate;
    });

    res.status(200).json({
        status: 'success',
        results: sortedShops.length,
        data: { shops: sortedShops }
    });
});

exports.getInventory = catchAsync(async (req, res, next) => {
    const shop = await Shop.findOne({ user: req.user.id });
    
    if (!shop) {
        return next(new AppError('Shop not found', 404));
    }

    res.status(200).json({
        status: 'success',
        results: shop.inventory.length,
        data: {
            inventory: shop.inventory
        }
    });
});

exports.updateInventory = catchAsync(async (req, res, next) => {
    const { items } = req.body;
    
    // Validate input
    if (!items || !Array.isArray(items)) {
        return next(new AppError('Please provide valid inventory items array', 400));
    }

    // Validate each item
    for (const item of items) {
        if (!item.itemName || !item.quantity || !item.unit || !item.pricePerUnit) {
            return next(new AppError('Each item must have itemName, quantity, unit, and pricePerUnit', 400));
        }
    }

    // Find shop and update inventory
    const shop = await Shop.findOne({ user: req.user.id });
    
    if (!shop) {
        return next(new AppError('Shop not found', 404));
    }

    // Merge new items with existing inventory
    const updatedInventory = [...shop.inventory];
    
    items.forEach(newItem => {
        const existingItemIndex = updatedInventory.findIndex(item => 
            item.itemName.toLowerCase() === newItem.itemName.toLowerCase() && 
            item.unit.toLowerCase() === newItem.unit.toLowerCase()
        );

        if (existingItemIndex !== -1) {
            // Update existing item
            updatedInventory[existingItemIndex] = {
                ...updatedInventory[existingItemIndex],
                ...newItem
            };
        } else {
            // Add new item
            updatedInventory.push(newItem);
        }
    });

    shop.inventory = updatedInventory;
    await shop.save();

    res.status(200).json({
        status: 'success',
        data: {
            inventory: shop.inventory
        }
    });
});

exports.addInventoryItem = catchAsync(async (req, res, next) => {
    const { itemName, quantity, unit, pricePerUnit, category } = req.body;

    // Validate input
    if (!itemName || !quantity || !unit || !pricePerUnit || !category) {
        return next(new AppError('Please provide itemName, quantity, unit, pricePerUnit, and category', 400));
    }

    // Convert quantity to number
    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity)) {
        return next(new AppError('Quantity must be a valid number', 400));
    }

    let shop = await Shop.findOne({ user: req.user.id });
    
    if (!shop) {
        // Create a new shop with minimal required fields if it doesn't exist
        shop = await Shop.create({
            user: req.user.id,
            shopName: 'Temporary Shop Name', // Default name
            name: 'Temporary Shop Name', // Default name for required field
            contactInfo: {
                email: req.user.email || 'temp@email.com',
                phone: '0000000000'
            },
            location: {
                type: "Point",
                coordinates: [0, 0]
            }
        });
    }

    // Check if item already exists
    const existingItemIndex = shop.inventory.findIndex(item => 
        item.itemName.toLowerCase() === itemName.toLowerCase() && 
        item.unit.toLowerCase() === unit.toLowerCase()
    );

    if (existingItemIndex !== -1) {
        // Update existing item - properly add quantities as numbers
        const currentQuantity = Number(shop.inventory[existingItemIndex].quantity);
        shop.inventory[existingItemIndex].quantity = currentQuantity + numericQuantity;
        shop.inventory[existingItemIndex].pricePerUnit = Number(pricePerUnit);
        shop.inventory[existingItemIndex].category = category;
    } else {
        // Add new item
        shop.inventory.push({
            itemName,
            quantity: numericQuantity,
            unit,
            pricePerUnit: Number(pricePerUnit),
            category
        });
    }

    await shop.save({ validateBeforeSave: false }); // Skip validation

    res.status(200).json({
        status: 'success',
        data: {
            inventory: shop.inventory
        }
    });
});

exports.updateInventoryItem = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;
    const { quantity, pricePerUnit } = req.body;

    const shop = await Shop.findOne({ user: req.user.id });
    
    if (!shop) {
        return next(new AppError('Shop not found', 404));
    }

    const item = shop.inventory.id(itemId);
    if (!item) {
        return next(new AppError('Item not found in inventory', 404));
    }

    // Update item
    if (quantity !== undefined) item.quantity = quantity;
    if (pricePerUnit !== undefined) item.pricePerUnit = pricePerUnit;

    await shop.save();

    res.status(200).json({
        status: 'success',
        data: {
            item
        }
    });
});

exports.deleteInventoryItem = catchAsync(async (req, res, next) => {
    const { itemId } = req.params;

    const shop = await Shop.findOne({ user: req.user.id });
    
    if (!shop) {
        return next(new AppError('Shop not found', 404));
    }

    const item = shop.inventory.id(itemId);
    if (!item) {
        return next(new AppError('Item not found in inventory', 404));
    }

    item.remove();
    await shop.save();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get all orders for the logged-in shopkeeper
exports.getShopOrders = catchAsync(async (req, res, next) => {
    try {
        // Find the shop associated with the logged-in user
        const shop = await Shop.findOne({ user: req.user.id });
        if (!shop) {
            return next(new AppError('No shop found for this user', 404));
        }

        // Get all donations for this shop
        const donations = await Donation.find({ shop: shop._id })
            .select('donor institute items totalAmount status createdAt')
            .sort('-createdAt');

        res.status(200).json({
            status: 'success',
            results: donations.length,
            data: {
                donations
            }
        });
    } catch (error) {
        console.error('Error in getShopOrders:', error);
        return next(new AppError('Failed to fetch orders', 500));
    }
});

// Get orders by status for the logged-in shopkeeper
exports.getShopOrdersByStatus = catchAsync(async (req, res, next) => {
    const { status } = req.params;
    const validStatuses = ['pending', 'processing', 'shipping', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid status. Status must be one of: ' + validStatuses.join(', '), 400));
    }

    // Find the shop associated with the logged-in user
    const shop = await Shop.findOne({ user: req.user.id });
    if (!shop) {
        return next(new AppError('No shop found for this user', 404));
    }

    // Get donations with the specified status
    const orders = await Donation.find({ 
        shop: shop._id,
        status: status 
    })
    .populate({
        path: 'donor',
        select: 'name email address'
    })
    .populate({
        path: 'institute',
        select: 'institute_name institute_type user',
        populate: {
            path: 'user',
            select: 'name email address'
        }
    })
    .sort('-createdAt');

    // Transform the data to include shipping status
    const transformedOrders = await Promise.all(orders.map(async (order) => {
        const shipping = await Shipping.findOne({ donation: order._id })
            .select('status qrCode deliveryProof');

        return {
            orderId: order._id,
            createdAt: order.createdAt,
            status: order.status,
            items: order.items,
            totalAmount: order.totalAmount,
            institute: {
                name: order.institute.institute_name,
                type: order.institute.institute_type,
                address: order.institute.user.address,
                contact: {
                    name: order.institute.user.name,
                    email: order.institute.user.email
                }
            },
            donor: {
                name: order.donor.name,
                email: order.donor.email,
                address: order.donor.address
            },
            shipping: shipping ? {
                status: shipping.status,
                verificationCode: shipping.qrCode,
                isDelivered: shipping.status === 'delivered',
                deliveryProof: shipping.deliveryProof
            } : null
        };
    }));

    res.status(200).json({
        status: 'success',
        results: transformedOrders.length,
        data: {
            orders: transformedOrders
        }
    });
}); 