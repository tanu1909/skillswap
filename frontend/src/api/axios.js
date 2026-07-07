import axios from 'axios';

const API_ORIGIN = import.meta.env.VITE_API_URL || 'https://skillswap-3-r5yn.onrender.com';
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
