import express from 'express'
import { registerUser,loginUser, getProfile,updateProfile ,bookAppointment, listAppointment,cancelAppointment, startPayment, completePayment} from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'
const userRouter=express.Router()
userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile', authUser,upload.single("image"), updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.post('/appointments',upload.none(),authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/pay/getAmount',authUser,startPayment)
userRouter.post('/pay/success',authUser,completePayment)
export default userRouter