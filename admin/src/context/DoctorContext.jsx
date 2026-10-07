import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '');
    const [dRefreshToken, setDRefreshToken] = useState(localStorage.getItem('dRefreshToken') || '');
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const [profileData, setProfileData] = useState(false);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => {
                if (response.data && response.data.isExpired && response.config?.headers?.dToken) {
                    return handleDoctorRefresh(response.config);
                }
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401 && originalRequest?.headers?.dToken && !originalRequest._retry) {
                    return handleDoctorRefresh(originalRequest);
                }
                return Promise.reject(error);
            }
        );

        const handleDoctorRefresh = async (originalRequest) => {
            if (!originalRequest || originalRequest.url?.includes('/api/doctor/refresh-token') || originalRequest.url?.includes('/api/doctor/login')) {
                return Promise.reject(new Error("Doctor auth endpoint failed"));
            }

            originalRequest._retry = true;
            const currentRefreshToken = localStorage.getItem('dRefreshToken');
            if (!currentRefreshToken) {
                logoutDoctor();
                return Promise.reject(new Error("No doctor refresh token"));
            }

            try {
                const { data } = await axios.post(`${backendUrl}/api/doctor/refresh-token`, {
                    refreshToken: currentRefreshToken
                });

                if (data.success) {
                    localStorage.setItem('dToken', data.token);
                    if (data.refreshToken) {
                        localStorage.setItem('dRefreshToken', data.refreshToken);
                        setDRefreshToken(data.refreshToken);
                    }
                    setDToken(data.token);
                    originalRequest.headers.dToken = data.token;
                    return axios(originalRequest);
                } else {
                    logoutDoctor();
                    toast.error("Doctor session expired. Please log in again.");
                    return Promise.reject(new Error("Doctor refresh failed"));
                }
            } catch (err) {
                logoutDoctor();
                toast.error("Doctor session expired. Please log in again.");
                return Promise.reject(err);
            }
        };

        return () => axios.interceptors.response.eject(interceptor);
    }, [backendUrl]);

    const logoutDoctor = async () => {
        try {
            const currentToken = localStorage.getItem('dToken');
            if (currentToken) {
                await axios.post(`${backendUrl}/api/doctor/logout`, {}, { headers: { dToken: currentToken } });
            }
        } catch (e) {
            console.log("Doctor logout error:", e.message);
        } finally {
            localStorage.removeItem('dToken');
            localStorage.removeItem('dRefreshToken');
            localStorage.removeItem('doctorId');
            setDToken('');
            setDRefreshToken('');
        }
    };

    const getAppointments = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/appointments', {}, { headers: { dToken } });
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const completeAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/doctor/complete-appointment",
                { appointmentId },
                { headers: { dToken } }
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
                { headers: { dToken } }
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
            const { data } = await axios.post(backendUrl + "/api/doctor/dashboard", {}, {
                headers: { dToken },
            });

            if (data.success) {
                setDashData(data.dashData);
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
            const { data } = await axios.post(backendUrl + '/api/doctor/profile', {}, { headers: { dToken } });
            if (data.success) {
                setProfileData(data.profileData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const value = {
        dToken,
        setDToken,
        dRefreshToken,
        setDRefreshToken,
        logoutDoctor,
        backendUrl,
        getAppointments,
        appointments,
        setAppointments,
        completeAppointment,
        cancelAppointment,
        dashData,
        setDashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData
    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
};

export default DoctorContextProvider;