const express = require("express");

const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

// const userController = require("./../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.get("/user", authController.user);
router.get("/role", authController.role);
// router.get("/search", userController.searchUser); // Not included in the provided controllers

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.get("/me", userController.getMe);
router.get("/dashboard", userController.getDashboardData);
router.patch(
  "/updateme",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

// router.use(authController.restrictTo("admin", "agent"));

// router.route("/").get(userController.getalluser); // Not included in the provided controllers
// router.get("/:id", userController.getUserDetails); // Not included in the provided controllers

module.exports = router;
