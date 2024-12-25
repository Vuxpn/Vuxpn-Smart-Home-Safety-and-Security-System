import { createContext, useContext, useState } from 'react';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const DeviceContext = createContext(null);

export const DeviceProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Điều khiển cảnh báo
    const controlWarning = async (deviceId, state) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(`/device/${deviceId}/warning`, {
                deviceId,
                state,
            });
            setError(null);
            toast.success('Warning control updated successfully');
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to control warning';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật ngưỡng cảnh báo
    const updateWarningThresholds = async (deviceId, thresholds) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(`/device/${deviceId}/warningLevel`, {
                deviceId,
                ...thresholds,
            });
            setError(null);
            toast.success('Warning thresholds updated successfully');
            return response.data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update thresholds';
            setError(errorMessage);
            toast.error(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        loading,
        error,
        controlWarning,
        updateWarningThresholds,
    };

    return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};

// Custom hook để sử dụng device context
export const useDevice = () => {
    const context = useContext(DeviceContext);
    if (!context) {
        throw new Error('useDevice must be used within a DeviceProvider');
    }
    return context;
};
