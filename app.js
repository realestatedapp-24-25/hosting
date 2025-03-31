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
app.all("*", (req, res, next) => {
  next(new AppError(`can't find the ${req.originalUrl} url`));
});

module.exports = app;
