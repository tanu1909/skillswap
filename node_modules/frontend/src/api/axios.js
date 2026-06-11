import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
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