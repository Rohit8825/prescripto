import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
    const [aRefreshToken, setARefreshToken] = useState(localStorage.getItem('aRefreshToken') || '');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => {
                if (response.data && response.data.isExpired && response.config?.headers?.atoken) {
                    return handleAdminRefresh(response.config);
                }
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401 && originalRequest?.headers?.atoken && !originalRequest._retry) {
                    return handleAdminRefresh(originalRequest);
                }
                return Promise.reject(error);
            }
        );

        const handleAdminRefresh = async (originalRequest) => {
            if (!originalRequest || originalRequest.url?.includes('/api/admin/refresh-token') || originalRequest.url?.includes('/api/admin/login')) {
                return Promise.reject(new Error("Admin auth endpoint failed"));
            }

            originalRequest._retry = true;
            const currentRefreshToken = localStorage.getItem('aRefreshToken');
            if (!currentRefreshToken) {
                logoutAdmin();
                return Promise.reject(new Error("No admin refresh token"));
            }

            try {
                const { data } = await axios.post(`${backendUrl}/api/admin/refresh-token`, {
                    refreshToken: currentRefreshToken
                });

                if (data.success) {
                    localStorage.setItem('aToken', data.token);
                    if (data.refreshToken) {
                        localStorage.setItem('aRefreshToken', data.refreshToken);
                        setARefreshToken(data.refreshToken);
                    }
                    setAToken(data.token);
                    originalRequest.headers.atoken = data.token;
                    return axios(originalRequest);
                } else {
                    logoutAdmin();
                    toast.error("Admin session expired. Please log in again.");
                    return Promise.reject(new Error("Admin refresh failed"));
                }
            } catch (err) {
                logoutAdmin();
                toast.error("Admin session expired. Please log in again.");
                return Promise.reject(err);
            }
        };

        return () => axios.interceptors.response.eject(interceptor);
    }, [backendUrl]);

    const logoutAdmin = () => {
        localStorage.removeItem('aToken');
        localStorage.removeItem('aRefreshToken');
        setAToken('');
        setARefreshToken('');
    };

    const getAllDoctors = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: { atoken: aToken } });
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const changeAvailability = async (docId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { atoken: aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllDoctors();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getAllAppointments = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/appointments', {}, { headers: { atoken: aToken } });
            if (data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { atoken: aToken } });
            if (data.success) {
                toast.success(data.message);
                getAllAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { atoken: aToken } });
            if (data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const value = {
        aToken,
        setAToken,
        aRefreshToken,
        setARefreshToken,
        logoutAdmin,
        backendUrl,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        setAppointments,
        getAllAppointments,
        cancelAppointment,
        dashData,
        getDashData
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;