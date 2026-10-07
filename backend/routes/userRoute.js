import express from 'express';
import {
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
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/refresh-token', refreshTokenUser);
userRouter.post('/logout', authUser, logoutUser);
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, upload.single("image"), updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.post('/appointments', upload.none(), authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/pay/getAmount', authUser, startPayment);
userRouter.post('/pay/success', authUser, completePayment);
userRouter.post('/payment-stripe', authUser, paymentStripe);
userRouter.post('/verify-stripe', authUser, verifyStripe);

export default userRouter;