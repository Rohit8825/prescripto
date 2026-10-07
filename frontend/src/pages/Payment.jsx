import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Payment = () => {
    const navigate = useNavigate();
    const { currencySymbol, backendUrl, token } = useContext(AppContext);
    const { appointmentId } = useParams();
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [stripeProcessing, setStripeProcessing] = useState(false);

    const fetchAppointmentAmount = async () => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/pay/getAmount`,
                { appointmentId },
                { headers: { token } }
            );
            if (data.success) {
                setAmount(data.amount);
            } else {
                toast.error(data.message || "Failed to load appointment details");
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchAppointmentAmount();
        } else {
            navigate('/login');
        }
    }, [token, appointmentId]);

    const payWithStripe = async () => {
        try {
            setStripeProcessing(true);
            const { data } = await axios.post(
                `${backendUrl}/api/user/payment-stripe`,
                { appointmentId },
                { headers: { token } }
            );

            if (data.success && data.session_url) {
                // Redirect user to Stripe's secure checkout page
                window.location.href = data.session_url;
            } else {
                toast.error(data.message || "Unable to initialize Stripe payment");
                setStripeProcessing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            setStripeProcessing(false);
        }
    };

    const simulateSuccess = async () => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/user/pay/success`,
                { appointmentId },
                { headers: { token } }
            );
            if (data.success) {
                toast.success(`Payment of ${currencySymbol}${amount} Successful!`);
                navigate("/my-appointment");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className='flex w-full justify-center min-h-[500px] items-center px-4 py-10'>
            <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center'>
                <div className='w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold'>
                    {currencySymbol}
                </div>
                <h1 className='text-2xl font-bold text-gray-800 mb-2'>Consultation Payment</h1>
                <p className='text-gray-500 text-sm mb-6'>Complete your doctor appointment payment securely</p>

                {loading ? (
                    <div className='py-12 flex justify-center items-center'>
                        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600'></div>
                    </div>
                ) : (
                    <div>
                        <div className='bg-gray-50 border border-gray-100 rounded-xl p-5 mb-6 text-left'>
                            <div className='flex justify-between items-center mb-2'>
                                <span className='text-gray-600 text-sm'>Appointment ID:</span>
                                <span className='font-mono text-xs text-gray-800 truncate max-w-[180px]'>{appointmentId}</span>
                            </div>
                            <div className='flex justify-between items-center border-t border-gray-200 pt-2 mt-2'>
                                <span className='text-gray-800 font-semibold'>Total Payable:</span>
                                <span className='text-2xl font-bold text-indigo-600'>{currencySymbol}{amount}</span>
                            </div>
                        </div>

                        {/* Stripe Checkout Button */}
                        <button
                            onClick={payWithStripe}
                            disabled={stripeProcessing}
                            className='w-full bg-[#635BFF] hover:bg-[#5249e0] text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50'
                        >
                            {stripeProcessing ? (
                                <span>Redirecting to Stripe...</span>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697.45 12.872.45 6.643.45 2.5 3.738 2.5 8.79c0 5.494 4.55 7.18 7.37 8.324 2.479 1.002 3.328 1.685 3.328 2.705 0 1.054-.937 1.632-2.316 1.632-2.392 0-5.362-1.127-7.23-2.227l-.92 5.564c2.08 1.127 5.154 1.762 8.358 1.762 6.577 0 10.91-3.15 10.91-8.524 0-5.344-4.22-7.05-8.024-8.875z"/>
                                    </svg>
                                    <span>Pay with Stripe</span>
                                </>
                            )}
                        </button>

                        {/* Fallback Simulation Button */}
                        <div className='mt-6 pt-4 border-t border-gray-100'>
                            <p className='text-xs text-gray-400 mb-3'>Testing options without active Stripe keys:</p>
                            <div className='flex gap-3'>
                                <button
                                    onClick={simulateSuccess}
                                    className='flex-1 border border-green-500 text-green-700 hover:bg-green-50 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition'
                                >
                                    Simulate Success
                                </button>
                                <button
                                    onClick={() => navigate('/my-appointment')}
                                    className='flex-1 border border-gray-300 text-gray-600 hover:bg-gray-100 py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;