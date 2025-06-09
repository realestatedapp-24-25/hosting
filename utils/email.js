const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require("html-to-text");
const path = require('path');

module.exports = class Email {
  constructor(user, data) {
    if (!user || !user.email || !user.name) {
      throw new Error('Invalid user data for email');
    }
    
    this.to = user.email;
    this.firstName = user.name.split(" ")[0] || user.name;
    this.data = data || {};
    this.from = `Donation App <${process.env.GMAIL_ADDRESS}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    try {
      const html = pug.renderFile(`${__dirname}/../email/${template}.pug`, {
        firstName: this.firstName,
        subject,
        instituteName: this.data.instituteName,
        items: this.data.items || [],
        totalAmount: this.data.totalAmount,
        verificationCode: this.data.verificationCode,
        qrCodeData: this.data.qrCodeData,
        shopName: this.data.shopName,
        instituteAddress: this.data.instituteAddress
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html)
      };

      await this.newTransport().sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Our Community! 🎉");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }

  async sendDonationNotification(shopName, items, totalAmount) {
    await this.send('donationNotification', 'New Donation Received', {
      shopName,
      items,
      totalAmount,
    });
  }

  async sendDonationNotificationWithQR() {
    await this.send('donationNotificationWithQR', 'New Donation Received');
  }

  async sendAnomalyAlert() {
    await this.send('anomalyAlert', 'High Request Activity Alert');
  }

  async sendShopDeliveryNotification() {
    await this.send('shopDeliveryNotification', 'New Delivery Request');
  }
};