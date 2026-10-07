import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import Stripe from 'stripe';

const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password || !name) {
            return res.json({ success: false, message: "Missing Details" });
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid Email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken = refreshToken;
        await user.save();

        res.json({ success: true, token: accessToken, refreshToken });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken(user._id);
            user.refreshToken = refreshToken;
            await user.save();

            res.json({ success: true, token: accessToken, refreshToken });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const refreshTokenUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: 'Refresh token required' });
        }

        const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, refreshSecret);
        } catch (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        const user = await userModel.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ success: false, message: 'Invalid refresh token session' });
        }

        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({ success: true, token: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const logoutUser = async (req, res) => {
    try {
        const { userId } = req;
        if (userId) {
            await userModel.findByIdAndUpdate(userId, { refreshToken: '' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const { userId } = req;
        const userData = await userModel.findById(userId).select('-password');
        if (!userData) return res.json({ success: false, message: "User not Found" });
        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId } = req;
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender });

        if (imageFile) {
            let prevImage = await userModel.findById(userId);
            if (prevImage && prevImage.imageId) {
                try {
                    await cloudinary.uploader.destroy(prevImage.imageId);
                } catch (error) {
                    console.log("Error deleting old image:", error.message);
                }
            }

            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;

            await userModel.findByIdAndUpdate(userId, { image: imageURL, imageId: imageUpload.public_id });
        }

        res.json({ success: true, message: 'Profile Updated' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Double booking prevention using atomic conditional reservation and unique compound index rollback
const bookAppointment = async (req, res) => {
    try {
        const { userId } = req;
        const { docId, slotDate, slotTime } = req.body;

        if (!docId || !slotDate || !slotTime) {
            return res.json({ success: false, message: "Missing appointment details" });
        }

        const docData = await doctorModel.findById(docId).select("-password");
        if (!docData) {
            return res.json({ success: false, message: "Doctor not found" });
        }
        if (!docData.available) {
            return res.json({ success: false, message: "Doctor Not Available" });
        }

        const userData = await userModel.findById(userId).select("-password");
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const slotPath = `slots_booked.${slotDate}`;

        // Atomic conditional check & reserve:
        // Ensures the slot is not already reserved by a concurrent request
        const updatedDoctor = await doctorModel.findOneAndUpdate(
            {
                _id: docId,
                available: true,
                $or: [
                    { [slotPath]: { $exists: false } },
                    { [slotPath]: { $ne: slotTime } }
                ]
            },
            {
                $push: { [slotPath]: slotTime }
            },
            { new: true }
        );

        if (!updatedDoctor) {
            return res.json({ success: false, message: "Selected slot is already booked or unavailable" });
        }

        const appointmentData = {
            userId,
            docId,
            userData,
            docData: {
                name: docData.name,
                fees: docData.fees,
                address: docData.address,
                image: docData.image,
                speciality: docData.speciality
            },
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            cancelled: false,
            payment: false,
            isCompleted: false
        };

        try {
            await new appointmentModel(appointmentData).save();
        } catch (saveError) {
            // Roll back the reserved slot if database unique constraint fails
            await doctorModel.findByIdAndUpdate(docId, {
                $pull: { [slotPath]: slotTime }
            });
            if (saveError.code === 11000) {
                return res.json({ success: false, message: "Selected slot has already been booked" });
            }
            throw saveError;
        }

        return res.json({ success: true, message: "Appointment Booked" });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

const listAppointment = async (req, res) => {
    try {
        const userId = req.userId;
        const appointments = await appointmentModel.find({ userId });
        res.json({ success: true, appointments });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

const cancelAppointment = async (req, res) => {
    try {
        const { userId } = req;
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }

        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        if (appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment is already cancelled" });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const { docId, slotDate, slotTime } = appointmentData;
        const slotPath = `slots_booked.${slotDate}`;
        await doctorModel.findByIdAndUpdate(docId, {
            $pull: { [slotPath]: slotTime }
        });

        res.json({ success: true, message: "Appointment cancelled" });

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};

const startPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await appointmentModel.findById(appointmentId);
        if (appointment) {
            res.status(200).json({ success: true, amount: appointment.amount, message: "Success" });
        } else {
            res.status(404).json({ success: false, message: "Appointment not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const completePayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });

        if (appointment) {
            res.status(200).json({ success: true, transactionId: "dummyTransaction1234", message: "Success" });
        } else {
            res.status(400).json({ success: false, message: "Unable to complete payment" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Stripe Checkout Payment integration
const paymentStripe = async (req, res) => {
    try {
        const { userId } = req;
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        if (appointment.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }
        if (appointment.cancelled) {
            return res.status(400).json({ success: false, message: "Appointment is cancelled" });
        }
        if (appointment.payment) {
            return res.status(400).json({ success: false, message: "Appointment already paid" });
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey || stripeKey === 'sk_test_placeholder_key') {
            return res.status(400).json({
                success: false,
                message: "Stripe Secret Key is not configured in backend/.env. Please add your Stripe API key."
            });
        }

        const stripe = new Stripe(stripeKey);
        const currency = (process.env.STRIPE_CURRENCY || 'inr').toLowerCase();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const unitAmount = Math.round(appointment.amount * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: `Appointment with ${appointment.docData.name}`,
                            description: `Speciality: ${appointment.docData.speciality || 'Consultation'} | Date: ${appointment.slotDate} | Time: ${appointment.slotTime}`
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                }
            ],
            mode: 'payment',
            success_url: `${frontendUrl}/verify-stripe?success=true&appointmentId=${appointmentId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/verify-stripe?success=false&appointmentId=${appointmentId}`,
            metadata: {
                appointmentId: String(appointmentId),
                userId: String(userId)
            }
        });

        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyStripe = async (req, res) => {
    try {
        const { userId } = req;
        const { appointmentId, sessionId, success } = req.body;

        if (success === false || success === 'false') {
            return res.json({ success: false, message: "Payment was cancelled or failed." });
        }

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }
        if (appointment.userId !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized action" });
        }
        if (appointment.payment) {
            return res.json({ success: true, message: "Payment already verified." });
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            return res.status(400).json({ success: false, message: "Stripe key not configured" });
        }

        const stripe = new Stripe(stripeKey);
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            await appointmentModel.findByIdAndUpdate(appointmentId, {
                payment: true,
                paymentId: session.payment_intent || sessionId,
                paymentMethod: 'Stripe'
            });
            return res.json({ success: true, message: "Payment successful and verified!" });
        } else {
            return res.json({ success: false, message: "Payment not completed." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    registerUser,
    loginUser,
    refreshTokenUser,
    logoutUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    startPayment,
    completePayment,
    paymentStripe,
    verifyStripe
};
