import React, { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Payment = () => {
    const navigate = useNavigate();
    const {currencySymbol, backendUrl,token } = useContext(AppContext)
    const {appointmentId} = useParams();
    const [amount, setAmount] = useState(0);
    const [loading , setLoading] = useState(true);

    const startPayment = async()=>{
        // toast.loading("Wait till we load Amount");
        try {
            const {data} = await axios.post(backendUrl + "/api/user/pay/getAmount",{appointmentId},{headers:{token}});
            toast.dismiss()
            setAmount(data.amount);
            setLoading(false);
        } catch (error) {
            toast.dismiss()
            toast.error(error);
            // navigate("/my-appointments");
        }
    }
    useState(()=>{
        startPayment();
    },[])

    const simulateSuccess = async()=>{
        
        try {
            const {data} = await axios.post(backendUrl + "/api/user/pay/success",{appointmentId},{headers:{token}});
            if(data.success){
                toast.success(`Payment of ${amount} ${currencySymbol} is Successfull\nTransationId : ${data.transactionId}`);
            }else toast.error(data.message);
        } catch (error) {
            toast.error(error);
        }finally{
            navigate("/my-appointment");
        }
    }
    const simulateFailure = async()=>{
        toast.warn("Payment Failed or Cancelled");
        navigate("/my-appointment");
    }
  return (
    <div className='flex w-full justify-center h-[400px] border rounded-xl border-gray-200 bg-gray-100 px-4'>
        <div className='flex flex-col items-center'>
            <h1 className='mt-10 font-bold text-blue-800 text-3xl sm:text-5xl text-center'>This is Dummy Payment Gateway</h1>
            <h2 className='mt-5 text-2xl'>Pay {amount} {currencySymbol}</h2>

            {!loading && <div className='flex gap-5 sm:gap-10 sm:flex-row flex-col mt-20'>
                <button onClick={()=>simulateSuccess(appointmentId)} className='border border-green-400 px-2 rounded bg-green-500/80 cursor-pointer hover:scale-105 duration-200 py-1'>Simulate Success</button>
                <button onClick={()=>simulateFailure(appointmentId)} className='border border-red-400 px-2 rounded bg-red-500/80 cursor-pointer hover:scale-105 duration-200 py-1'>Simulate Failure</button>
            </div>}
        </div>
    </div>
  )
}

export default Payment