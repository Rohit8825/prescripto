import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const currencySymbol = '₹';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [doctors, setDoctors] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');
    const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic') || '');

    // Setup Axios interceptors for automatic token attaching and refresh
    useEffect(() => {
        const reqInterceptor = axios.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token');
                if (currentToken && !config.headers.token) {
                    config.headers.token = currentToken;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        let isRefreshing = false;
        let failedQueue = [];

        const processQueue = (error, newToken = null) => {
            failedQueue.forEach((prom) => {
                if (error) {
                    prom.reject(error);
                } else {
                    prom.resolve(newToken);
                }
            });
            failedQueue = [];
        };

        const resInterceptor = axios.interceptors.response.use(
            (response) => {
                if (response.data && response.data.isExpired) {
                    const originalRequest = response.config;
                    return handleRefresh(originalRequest);
                }
                return response;
            },
            async (error) => {
                const originalRequest = error.config;
                if (error.response && error.response.status === 401 && !originalRequest?._retry) {
                    return handleRefresh(originalRequest);
                }
                return Promise.reject(error);
            }
        );

        const handleRefresh = async (originalRequest) => {
            if (!originalRequest) return;
            if (originalRequest.url?.includes('/api/user/refresh-token') || originalRequest.url?.includes('/api/user/login')) {
                return Promise.reject(new Error("Auth endpoint failed"));
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers.token = newToken;
                        return axios(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (!storedRefreshToken) {
                isRefreshing = false;
                logout();
                return Promise.reject(new Error("No refresh token available"));
            }

            try {
                const { data } = await axios.post(`${backendUrl}/api/user/refresh-token`, {
                    refreshToken: storedRefreshToken
                });

                if (data.success) {
                    localStorage.setItem('token', data.token);
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken);
                        setRefreshToken(data.refreshToken);
                    }
                    setToken(data.token);

                    processQueue(null, data.token);
                    originalRequest.headers.token = data.token;
                    return axios(originalRequest);
                } else {
                    processQueue(new Error("Refresh failed"), null);
                    logout();
                    toast.error("Session expired, please log in again.");
                    return Promise.reject(new Error("Refresh failed"));
                }
            } catch (refreshErr) {
                processQueue(refreshErr, null);
                logout();
                toast.error("Session expired, please log in again.");
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        };

        return () => {
            axios.interceptors.request.eject(reqInterceptor);
            axios.interceptors.response.eject(resInterceptor);
        };
    }, [backendUrl]);

    const logout = async () => {
        try {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                await axios.post(`${backendUrl}/api/user/logout`, {}, { headers: { token: currentToken } });
            }
        } catch (e) {
            console.log("Error during logout:", e.message);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('profilePic');
            setToken('');
            setRefreshToken('');
            setProfilePic('');
        }
    };

    const getDoctorData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/doctor/list`);
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        getDoctorData();
    }, []);

    const value = {
        doctors,
        getDoctorData,
        currencySymbol,
        token,
        setToken,
        refreshToken,
        setRefreshToken,
        logout,
        backendUrl,
        profilePic,
        setProfilePic,
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;