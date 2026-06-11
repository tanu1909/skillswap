import React, { createContext, useState, useEffect } from 'react';
import { loginAPI, registerAPI } from '../api/auth.api.js';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const[user, setUser] = useState(null);
    const[loading, setLoading] = useState(true);



    useEffect(()=>{
        const storedUser = localStorage.getItem('userInfo');
        if(storedUser){
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    },[]);


    //handle login
    const login = async(userData) => {
        const data = await loginAPI(userData);
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
    }


//handle registration
const register = async(userData) => {
    const data = await registerAPI(userData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
};


//handle logout

const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
};



return(
    <AuthContext.Provider value = {{ user, loading, login, register, logout}}>
    {!loading && children}
    </AuthContext.Provider>
);
};