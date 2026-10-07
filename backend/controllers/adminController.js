import validator from 'validator'
import bcrypt from 'bcrypt'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import jwt from 'jsonwebtoken'
import appointmentModel from  '../models/appointmentModel.js'
import userModel from '../models/userModel.js'
const addDoctor=async (req,res)=>{

    try {
       const {name,email,password,speciality,degree,experience,about,fees,address} =req.body
        const imageFile=req.file

       
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address ){
           return res.json({success:false,message:"Missing Details"})
        }
       
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"})
        }
        
        if(password.length<8){
           return res.json({success:false,message:"Please enter a strong password"})
        }
   
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

       
        const imageUpload=await cloudinary.uploader.upload(imageFile.path,{resource_type:"image"})
        const imageUrl=imageUpload.secure_url

        const doctorData={
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()

        }

        const newDoctor=new doctorModel(doctorData)
        await newDoctor.save()
        res.json({success:true,message:"Doctor Added"})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


const loginAdmin= async (req,res)=>{

    try {
        const {email,password}=req.body
        if(email=== process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
           const accessToken = jwt.sign(
               { role: 'admin', email: process.env.ADMIN_EMAIL },
               process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
               { expiresIn: '15m' }
           );
           const refreshToken = jwt.sign(
               { role: 'admin', email: process.env.ADMIN_EMAIL },
               process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
               { expiresIn: '7d' }
           );
           res.json({success:true, token: accessToken, refreshToken})
        }
        else{
            res.json({success:false,message:"Invalid credentials"})
        }
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const refreshTokenAdmin = async (req, res) => {
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

        if (decoded.role !== 'admin' || decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: 'Invalid admin credentials in token' });
        }

        const newAccessToken = jwt.sign(
            { role: 'admin', email: process.env.ADMIN_EMAIL },
            process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        const newRefreshToken = jwt.sign(
            { role: 'admin', email: process.env.ADMIN_EMAIL },
            process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ success: true, token: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const allDoctors=async (req,res)=>{
    try {
      const doctors=await doctorModel.find({}).select('-password') 
       res.json({success:true,doctors})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const appointmentsAdmin=async (req,res)=>{
    try {
        const appointments=await appointmentModel.find({})
        res.json({success:true,appointments})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
    }

const appointmantCancel=async (req,res)=>{
  try {
        
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
    await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
   
    const {docId,slotDate,slotTime}=appointmentData
    const doctorData=await doctorModel.findById(docId)
    if (!doctorData) {
      return res.json({ success: false, message: "Doctor not found for this appointment." });
    }
    let slots_booked = doctorData.slots_booked || {};
    if (Array.isArray(slots_booked[slotDate])) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(slot => slot !== slotTime);
    }
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment cancelled" });


  } catch (error) {
     console.error(error);
     res.json({ success: false, message: error.message });
  }
}

const adminDashboard=async (req,res)=>{
    try {
      const doctors=await doctorModel.find({})
      const appointments=await appointmentModel.find({})
      const users=await userModel.find({})

      const dashData={
        doctors:doctors.length,
        appointments:appointments.length,
        patients:users.length,
        latestAppointments:appointments.reverse().slice(0,5)

      }

      res.json({success:true, dashData})


        
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

export {addDoctor,loginAdmin,refreshTokenAdmin,allDoctors,appointmentsAdmin,appointmantCancel,adminDashboard}
