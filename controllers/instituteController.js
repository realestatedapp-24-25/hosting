const Institute = require('../models/instituteModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create a new institute
exports.createInstitute = catchAsync(async (req, res, next) => {
    // Create the institute with a reference to the newly created user
    const institute = await Institute.create({
        user: req.user.id,
        institute_name: req.body.institute_name,
        institute_type: req.body.institute_type,
        verification_status: req.body.verification_status,
        verification_documents: req.body.verification_documents,
        description: req.body.description,
        geolocation: req.body.geolocation
    });

    res.status(201).json({
        status: 'success',
        data: { institute }
    });
});

// Get all institutes
exports.getAllInstitutes = catchAsync(async (req, res, next) => {
    const institutes = await Institute.find();
    res.status(200).json({
        status: 'success',
        results: institutes.length,
        data: { institutes }
    });
});

// Get a single institute
exports.getInstitute = catchAsync(async (req, res, next) => {
    const me = req.user.id;
    const institute = await Institute.findOne({ user: me });
    if (!institute) {
        return next(new AppError('No institute found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { institute }
    });
});

// Update an institute
exports.updateInstitute = catchAsync(async (req, res, next) => {
    const institute = await Institute.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!institute) {
        return next(new AppError('No institute found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { institute }
    });
});

// Delete an institute
exports.deleteInstitute = catchAsync(async (req, res, next) => {
    const institute = await Institute.findByIdAndDelete(req.params.id);
    if (!institute) {
        return next(new AppError('No institute found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});
