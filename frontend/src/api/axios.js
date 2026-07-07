import axios from 'axios';

const DEFAULT_API_ORIGIN = 'https://skillswap-3-r5yn.onrender.com';
const configuredApiOrigin = import.meta.env.VITE_API_URL || DEFAULT_API_ORIGIN;
const isLocalApiOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configuredApiOrigin);
const API_ORIGIN = import.meta.env.PROD && isLocalApiOrigin ? DEFAULT_API_ORIGIN : configuredApiOrigin;
const API_URL = `${API_ORIGIN.replace(/\/$/, '').replace(/\/api$/, '')}/api`;

const API = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


//interceptor to automat. inject jwt token before a request goes out

API.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('userInfo'));
        if(user && user.token){
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

export default API;
