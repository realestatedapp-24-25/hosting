const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieparser = require("cookie-parser");
const userRouter = require("./routes/userRoute");
const catchAsync = require('./utils/catchAsync');
const dotenv = require('dotenv').config();
const donorRouter = require('./routes/donorRoute');
const instituteRouter = require('./routes/instituteRoute');
const shopRouter = require('./routes/shopRoute');
const requestRouter = require('./routes/requestRoute');
const shippingRouter = require('./routes/shippingRoute');
const reviewRouter = require('./routes/reviewRoute');
const paymentRoutes = require('./routes/paymentRoutes');
const AppError = require("./utils/appError");

const app = express();
const cors = require("cors");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());

app.use(cookieparser());
app.use(
  cors({
    origin: "https://careconnect-76uc.onrender.com",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
    ],
  })
);

// API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/donors", donorRouter);
app.use("/api/v1/institutes", instituteRouter);
app.use("/api/v1/shops", shopRouter);
app.use("/api/v1/requests", requestRouter);
app.use('/api/v1/shipping', shippingRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/payment', paymentRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// The "catchall" handler: for any request that doesn't match an API route,
// send back React's index.html file.
app.get('*', (req, res) => {
  // Only serve the frontend for non-API routes
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  } else {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  }
});

// Error handling for API routes
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
