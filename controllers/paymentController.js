const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/donationModel');
const catchAsync = require('../utils/catchAsync');

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
    success_url: `${req.protocol}://localhost:5173/donation-success?shop=${shopId}&institute=${instituteId}&amount=${totalAmount}&items=${encodeURIComponent(JSON.stringify(items))}`,
    cancel_url: `${req.protocol}://localhost:5173/donate/${instituteId}/details`,
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
    const { shop, institute, amount, items } = req.query;

    if (!shop || !institute || !amount || !items) {
      return res.status(400).json({ 
        status: 'error',
        message: "Missing parameters",
        received: { shop, institute, amount, items } 
      });
    }

    // Parse the items string back to an array
    const parsedItems = JSON.parse(decodeURIComponent(items));

    // Create donation record with items
    const donation = await Donation.create({
      donor: req.user._id,
      institute,
      shop,
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
        redirectUrl: `http://localhost:5173/profile/my-donations?donationId=${donation._id}`
      }
    });
  } catch (error) {
    console.error("Error processing donation:", error);
    res.status(500).json({
      status: 'error',
      message: "Failed to process donation",
      error: error.message
    });
  }
}); 