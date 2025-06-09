const Donation = require('../models/donationModel');
const catchAsync = require('../utils/catchAsync');

exports.getMyDonations = catchAsync(async (req, res, next) => {
  const donations = await Donation.find({ donor: req.user._id })
    .populate('institute', 'name')
    .populate('shop', 'shopName contactInfo address')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      donations
    }
  });
});

exports.getDonation = catchAsync(async (req, res, next) => {
  const donation = await Donation.findById(req.params.id)
    .populate('institute', 'name')
    .populate('shop', 'shopName contactInfo address')
    .populate('donor', 'name email');

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