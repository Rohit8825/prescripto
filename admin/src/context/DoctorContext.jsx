import { createContext,useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'
export const DoctorContext=createContext()

const DoctorContextProvider=(props)=>{
const backendUrl=import.meta.env.VITE_BACKEND_URL
const [dToken,setDToken]=useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken'):'')
const [appointments,setAppointments]=useState([])
const [dashData,setDashData]=useState(false)
const [profileData,setProfileData]=useState(false)
 const getAppointments=async()=>{
    try {
       const {data}=await axios.post(backendUrl + '/api/doctor/appointments',{}, {headers:{dToken:dToken}}) 
       if(data.success){
           setAppointments(data.appointments)
           //console.log(data.appointments)
       }
       else{
        toast.error(data.message)
       }
    } catch (error) {
        console.log(error);
        toast.error(error.message)
    }
 }

  const completeAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/complete-appointment",
        { appointmentId },
        { headers: { dToken: dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        await getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

   const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/cancel-appointment",
        { appointmentId },
        { headers: { dToken: dToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getDashData = async () => {
    try {
      const { data } = await axios.post(backendUrl + "/api/doctor/dashboard",{}, {
        headers: { dToken:dToken },
      });
     
      if (data.success) {
        setDashData(data.dashData);
        //console.log(data.dashData)
        // toast.success("Dashboard Loaded");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getProfileData = async () => {
    try {
        const {data}=await axios.post(backendUrl+'/api/doctor/profile',{},{headers:{dToken:dToken}})
        if(data.success){
            setProfileData(data.profileData)
            console.log(data.profileData)
            // toast.success("Profile Loaded Successfully")
        }
        else{
            toast.error(data.message)
        }

    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };


    const value={
       dToken,setDToken,backendUrl,getAppointments,appointments,setAppointments,completeAppointment,cancelAppointment,dashData,setDashData,getDashData,profileData,setProfileData,getProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}
export default DoctorContextProvider