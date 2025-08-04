import validator from 'validator';
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'


const registerUser=async (req,res)=>{
    try {
        const {name,email,password}=req.body

        if(!email || !password || !name){
            return res.json({success:false,message:"Missoing Details"})
        }
        if(!validator.isEmail(email)){
             return res.json({success:false,message:"Enter a valid Email"})
        }
        if(password.length<8){
            return res.json({success:false,message:"Enter a strong password"})
        }

        
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt)

        const userData={
            name,
            email,
            password:hashedPassword
        }

        const newUser=new userModel(userData)
        const user=await newUser.save()

        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
    }
}


const loginUser=async (req,res)=>{
    try {
       const {email,password}=req.body
       const user=await userModel.findOne({email})

    if(!user){
     return res.json({success:false,message:'User does not exist'})
    }
       const isMatch=await bcrypt.compare(password,user.password)

       if(isMatch){
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
        res.json({success:true,token})
       }
       else{
        res.json({success:false,message:"Invalid credentials"})
       }

    } catch (error) {
         console.log(error);
        res.json({success:false,message:error.message})
    }
}

 const getProfile=async(req,res)=>{
    try {
        const {userId}=req;
        const userData=await userModel.findById(userId).select('-password')
        if(!userData) res.json({success:false, message:"User not Found"});
        res.json({success:true,userData})
    } catch (error) {
         console.log(error);
        res.json({success:false,message:error.message})
    }


 }

 
 const updateProfile = async (req, res) => {

    try {
        const { userId } = req;
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            //delete previous image if exist
            let prevImageId = await userModel.findById(userId);
            prevImageId = prevImageId.imageId;
            if (prevImageId) {
                try {
                    cloudinary.uploader.destroy(prevImageId)
                } catch (error) {
                    console.log("Error deleting old image:", error.message);
                }
            }

            
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL, imageId: imageUpload.public_id })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}



const bookAppointment = async (req, res) => {
  try {
    const { userId } = req;
    const { docId, slotDate, slotTime } = req.body;

    
    const docData = await doctorModel
      .findById(docId)
      .select("-password");

    if (!docData) {
      return res.json({ success: false, message: "Doctor not found" });
    }
    if (!docData.available) {
      return res.json({ success: false, message: "Doctor Not Available" });
    }

    
    const slots_booked = docData.slots_booked || {};

    
    if (!Array.isArray(slots_booked[slotDate])) {
      slots_booked[slotDate] = [];
    }

    if (slots_booked[slotDate].includes(slotTime)) {
      return res.json({ success: false, message: "Slot Not Available" });
    }
    slots_booked[slotDate].push(slotTime);

    
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    
    const userData = await userModel
      .findById(userId)
      .select("-password");
    if (!userData) {
      return res.json({ success: false, message: "User not found" });
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
        
      },
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    await new appointmentModel(appointmentData).save();

    return res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};



const listAppointment=async (req,res)=>{
   try {
    const userId=req.userId;
   
    
    const appointments=await appointmentModel.find({userId})
    res.json({success:true,appointments})

    
   } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
   }
}



const cancelAppointment=async (req,res)=>{
  try {
        const { userId } = req;
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
    
    if(appointmentData.userId!==userId){
      return res.json({success:false,message:"Unauthorized action"})

    }
    await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
   
    const {docId,slotDate,slotTime}=appointmentData
    const doctorData=await doctorModel.findById(docId)
    let slots_booked = doctorData.slots_booked || {};
    if (Array.isArray(slots_booked[slotDate])) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(slot => slot !== slotTime);
    }
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment cancelled" });


  } catch (error) {
     console.error(error);
    return res.json({ success: false, message: error.message });
  }
}


const startPayment = async(req,res)=>{
    try {
      const {appointmentId} = req.body;
      const appointment = await appointmentModel.findById(appointmentId);
      if(appointment){
          res.status(200).json({success:true, amount:appointment.amount, message:"Success"});
      }
      else{
          res.status(404).json({success:false,message:"Appointment not found"})
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({success:false,message:error.message});
    }
}

const completePayment = async(req,res)=>{
    try {
      const {appointmentId} = req.body;
      const appointment = await appointmentModel.findByIdAndUpdate(appointmentId,{payment:true});
     
      
      if(appointment){
          res.status(200).json({success:true, transactionId:"dummyTrasnsaction1234", message:"Success"});
      }
      else{
          res.status(400).json({success:false,message:"Unable to complete payment"});
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({success:false,message:error.message});
      
    }
}


export {registerUser,loginUser,getProfile,updateProfile,bookAppointment,listAppointment,cancelAppointment,startPayment,completePayment}


