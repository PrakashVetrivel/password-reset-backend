const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Function to handle forgot password request
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // Token expiry time (1 hour)
    await user.save();

    // Configure email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    const resetUrl = `https://your-frontend-url/reset-password/${token}`;

    await transporter.sendMail({
        to: email,
        subject: 'Password Reset',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password</p>`
    });

    res.status(200).json({ message: 'Reset link sent' });
};

// Function to handle password reset request
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Valid token' });
};

// Function to update the password
exports.updatePassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Here, you should hash the password before saving it
    user.password = newPassword; // Simplified for this example
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password updated' });
};
