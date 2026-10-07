import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyStripe = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { backendUrl, token } = useContext(AppContext);
    const [verifying, setVerifying] = useState(true);

    const success = searchParams.get('success');
    const appointmentId = searchParams.get('appointmentId');
    const sessionId = searchParams.get('session_id');

    const verifyPayment = async () => {
        try {
            if (success === 'false' || !success) {
                toast.warn("Payment was cancelled or failed.");
                navigate('/my-appointment');
                return;
            }

            const { data } = await axios.post(
                `${backendUrl}/api/user/verify-stripe`,
                { appointmentId, sessionId, success },
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message || "Payment verified successfully!");
            } else {
                toast.error(data.message || "Payment verification failed.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setVerifying(false);
            navigate('/my-appointment');
        }
    };

    useEffect(() => {
        if (token && appointmentId) {
            verifyPayment();
        } else if (!token) {
            navigate('/login');
        }
    }, [token, appointmentId]);

    return (
        <div className='min-h-[400px] flex flex-col justify-center items-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4'></div>
            <p className='text-gray-600 text-lg font-medium'>Verifying your Stripe payment, please wait...</p>
        </div>
    );
};

export default VerifyStripe;
