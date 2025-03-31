const Donation = require('../models/donationModel');
const catchAsync = require('../utils/catchAsync');

exports.getMyDonations = catchAsync(async (req, res) => {
  const donations = await Donation.find({ donor: req.user._id })
    .populate([
      { path: 'shop', select: 'shopName contactInfo address' },
      { path: 'institute', select: 'name' }
    ])
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      donations
    }
  });
});

exports.getDonation = catchAsync(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate([
      { path: 'shop', select: 'shopName contactInfo address' },
      { path: 'institute', select: 'name' },
      { path: 'donor', select: 'name email' }
    ]);

  if (!donation) {
    return res.status(404).json({
      status: 'error',
      message: 'Donation not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      donation
    }
  });
}); 