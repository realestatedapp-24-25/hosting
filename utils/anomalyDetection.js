const Request = require('../models/requestModel');
const Institute = require('../models/instituteModel');
const User = require('../models/userModel');
const Email = require('./email');
const AppError = require('./appError');

const checkAnomaly = async (instituteId) => {
    try {
        const currentDate = new Date();
        const fiveDaysAgo = new Date(currentDate.setDate(currentDate.getDate() - 5));

        // Aggregate to count requests in the last 5 days
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

        const count = requestCount.length > 0 ? requestCount[0].count : 0;

        if (count >= 15) {
            // Get institute details
            const institute = await Institute.findById(instituteId).populate({
                path: 'user',
                select: 'name email'
            });

            if (!institute) {
                throw new AppError('Institute not found', 404);
            }

            // Get admin user
            const admin = await User.findOne({ 
                email: 'parthdesai@gmail.com',
                role: 'admin' 
            });

            if (!admin) {
                throw new AppError('Admin not found', 404);
            }

            // Send email to admin using our Email utility
            await new Email(admin, {
                instituteName: institute.institute_name,
                instituteEmail: institute.user.email,
                institutePerson: institute.user.name,
                requestCount: count,
                daysCount: 5,
                warningThreshold: 15
            }).sendAnomalyAlert();

            // Log the anomaly
            console.log(`Anomaly alert sent to admin for institute ${institute.institute_name}: ${count} requests in 5 days`);
        }
    } catch (error) {
        console.error('Error in anomaly detection:', error);
    }
};

module.exports = checkAnomaly; 