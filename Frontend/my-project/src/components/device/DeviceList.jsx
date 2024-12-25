import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import DeviceCard from './DeviceCard';
import { useHome } from '../../contexts/HomeContext';
import { toast } from 'react-toastify';

export default function DeviceList({ homeId }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { currentHome, fetchHomeDetails } = useHome();

    const fetchDevices = async () => {
        try {
            setLoading(true);
            // Sửa lại endpoint để match với backend API
            const response = await axiosInstance.get(`/device/home/${homeId}`);
            if (response.data.success) {
                setDevices(response.data.data || []);
            } else {
                throw new Error(response.data.message || 'Failed to fetch devices');
            }
        } catch (err) {
            setError('Failed to fetch devices');
            console.error('Error fetching devices:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch devices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (homeId) {
            fetchDevices();
        }
    }, [homeId]);

    const handleConnect = async (deviceId) => {
        try {
            const response = await axiosInstance.post(`/device/${deviceId}/connect`);
            toast.success(response.data.message);
            await fetchDevices(); // Refresh device list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to connect device');
            console.error('Failed to connect device:', err);
        }
    };

    const handleDisconnect = async (deviceId) => {
        try {
            const response = await axiosInstance.post(`/device/${deviceId}/disconnect`);
            toast.success(response.data.message);
            await fetchDevices(); // Refresh device list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to disconnect device');
            console.error('Failed to disconnect device:', err);
        }
    };

    const handleDelete = async (deviceId) => {
        try {
            if (!window.confirm('Are you sure you want to delete this device?')) {
                return;
            }

            const response = await axiosInstance.post(`/device/delete/${deviceId}`);
            toast.success('Device deleted successfully');
            await fetchDevices(); // Refresh device list
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete device');
            console.error('Failed to delete device:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {devices.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No devices found in this home.</p>
                </div>
            ) : (
                devices.map((device) => (
                    <DeviceCard
                        key={device.deviceId}
                        device={device}
                        onConnect={handleConnect}
                        onDisconnect={handleDisconnect}
                        onDelete={handleDelete}
                    />
                ))
            )}
        </div>
    );
}
