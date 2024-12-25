import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (token) {
                    const response = await axiosInstance.post('/auth/profile');
                    setUser(response.data);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            const { access_token, refresh_token, user } = response.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
            setUser(user);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
