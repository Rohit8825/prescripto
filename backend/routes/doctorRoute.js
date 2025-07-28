import express from 'express'
import { doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete,doctorDashboard,updateDoctorProfile,doctorProfile } from '../controllers/doctorController.js'
import authDoctor from '../middlewares/authDoctor.js'

const doctorRouter=express.Router()

doctorRouter.get('/list',doctorList)
doctorRouter.post('/login',loginDoctor)
doctorRouter.post('/appointments',authDoctor,appointmentsDoctor)
doctorRouter.post('/complete-appointment',authDoctor ,appointmentComplete);
doctorRouter.post('/cancel-appointment',authDoctor ,appointmentCancel);
doctorRouter.post('/dashboard',authDoctor ,doctorDashboard);
doctorRouter.post('/profile',authDoctor ,doctorProfile);
doctorRouter.post('/update-profile',authDoctor,updateDoctorProfile);

export default doctorRouter