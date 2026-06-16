const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/sendEmail");

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            isEmailVerified: true,
            isPhoneVerified: true
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Verify email address
// @route   POST /api/users/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    const { userId, code } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.emailVerificationCode !== code) {
            return res.status(400).json({ message: "Invalid email verification code" });
        }

        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Resend email verification code
// @route   POST /api/users/resend-email-code
// @access  Public
const resendEmailCode = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationCode = code;
        await user.save();

        sendEmail({
            email: user.email,
            subject: "Verify your email address - An.n.Ash",
            html: `
                <h1>Welcome to An.n.Ash!</h1>
                <p>Please verify your email address using this 6-digit code:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #C49A3C;">${code}</p>
                <p>This code will expire in 30 minutes.</p>
            `,
        }).catch(err => {
            console.error("Error resending verification email in background:", err.message);
        });

        res.json({ message: "Verification email resent", code });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Send phone verification OTP
// @route   POST /api/users/send-phone-otp
// @access  Public
const sendPhoneOtp = async (req, res) => {
    const { userId, phone } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.phone = phone;
        user.phoneVerificationCode = otp;
        await user.save();

        console.log(`[PHONE OTP DEBUG] Code for user ${user.email} (${phone}): ${otp}`);

        sendEmail({
            email: user.email,
            subject: "Your Phone Verification OTP - An.n.Ash",
            html: `
                <h1>Verify your phone number</h1>
                <p>Hello ${user.name},</p>
                <p>Your 6-digit phone verification OTP is: <strong>${otp}</strong></p>
                <p>Please enter this code on the website to complete your verification.</p>
            `
        }).catch(err => {
            console.error("Error sending phone OTP email in background:", err.message);
        });

        res.json({ message: "Phone verification OTP sent successfully", otp });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Verify phone number
// @route   POST /api/users/verify-phone
// @access  Public
const verifyPhone = async (req, res) => {
    const { userId, code } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.phoneVerificationCode !== code) {
            return res.status(400).json({ message: "Invalid phone verification OTP" });
        }

        user.isPhoneVerified = true;
        user.phoneVerificationCode = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            phone: user.phone,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                phone: user.phone,
                addresses: user.addresses
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;

            if (req.body.addresses) {
                user.addresses = req.body.addresses;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                phone: updatedUser.phone,
                addresses: updatedUser.addresses,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
    const { name, phone, email, street, city, state, pincode, country, isDefault } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const makeDefault = isDefault || user.addresses.length === 0;

        if (makeDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        user.addresses.push({
            name,
            phone,
            email,
            street,
            city,
            state,
            pincode,
            country: country || "India",
            isDefault: makeDefault,
        });

        await user.save();
        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const addressToDelete = user.addresses.id(req.params.id);
        if (!addressToDelete) {
            return res.status(404).json({ message: "Address not found" });
        }

        const wasDefault = addressToDelete.isDefault;
        user.addresses.pull({ _id: req.params.id });

        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Set an address as default
// @route   PUT /api/users/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const targetAddress = user.addresses.id(req.params.id);
        if (!targetAddress) {
            return res.status(404).json({ message: "Address not found" });
        }

        user.addresses.forEach((addr) => {
            addr.isDefault = addr._id.toString() === req.params.id;
        });

        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    verifyEmail,
    resendEmailCode,
    sendPhoneOtp,
    verifyPhone,
    addAddress,
    deleteAddress,
    setDefaultAddress
};
