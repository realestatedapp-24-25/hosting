const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/donationModel');
const Shop = require('../models/shopModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // Get the donation data from request body
  const { shopId, items, instituteId } = req.body;

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.quantity * item.pricePerUnit);
  }, 0);

  // Create line items for Stripe
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.name,
        description: `${item.quantity} ${item.unit}`,
      },
      unit_amount: item.pricePerUnit * 100, // Convert to paise
    },
    quantity: item.quantity,
  }));

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `https://careconnect-76uc.onrender.com/donation-success?shop=${shopId}&institute=${instituteId}&amount=${totalAmount}&items=${encodeURIComponent(JSON.stringify(items))}`,
    cancel_url: `https://careconnect-76uc.onrender.com/donate/${instituteId}/details`,
    customer_email: req.user.email,
    client_reference_id: shopId,
    line_items: lineItems,
    mode: 'payment',
    billing_address_collection: 'required',
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createDonationCheckout = catchAsync(async (req, res) => {
  try {
    const { shop: shopId, institute, amount, items } = req.query;

    if (!shopId || !institute || !amount || !items) {
      return res.status(400).json({ 
        status: 'error',
        message: "Missing parameters",
        received: { shopId, institute, amount, items } 
      });
    }

    // Parse the items string back to an array
    const parsedItems = JSON.parse(decodeURIComponent(items));

    // First verify if the shop has sufficient inventory
    const shop = await Shop.findById(shopId);
    if (!shop) {
      throw new AppError('Shop not found', 404);
    }

    // Verify inventory availability
    for (const item of parsedItems) {
      const inventoryItem = shop.inventory.find(i => i.itemName === item.name);
      if (!inventoryItem) {
        throw new AppError(`Item ${item.name} not found in shop inventory`, 400);
      }
      if (inventoryItem.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.name}`, 400);
      }
    }

    // Update inventory quantities using findOneAndUpdate for each item
    for (const item of parsedItems) {
      await Shop.findOneAndUpdate(
        { 
          _id: shopId,
          'inventory.itemName': item.name
        },
        {
          $inc: { 'inventory.$.quantity': -item.quantity }
        },
        { 
          new: true,
          runValidators: false // Disable validation for this update
        }
      );
    }

    // Create donation record with items
    const donation = await Donation.create({
      donor: req.user._id,
      institute,
      shop: shopId,
      items: parsedItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      })),
      totalAmount: amount,
      status: 'processing'
    });

    // Populate necessary fields
    const populatedDonation = await Donation.findById(donation._id)
      .populate([
        { path: 'shop', select: 'shopName contactInfo address' },
        { path: 'institute', select: 'name' },
        { path: 'donor', select: 'name email' }
      ]);

    // Return success response with frontend URL
    res.status(200).json({
      status: 'success',
      message: 'Donation created successfully',
      data: {
        donation: populatedDonation,
        redirectUrl: `https://careconnect-76uc.onrender.com/profile/my-donations?donationId=${donation._id}`
      }
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    res.status(500).json({
      status: 'error',
      message: error.message || "Failed to process donation",
      error: error.message
    });
  }
}); 