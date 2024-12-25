import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import DeviceList from '../../components/device/DeviceList';
import MemberManagement from '../../components/home/MemberManagement';
import AddDeviceForm from '../../components/device/AddDeviceForm';

export default function HomeDetail() {
    const { id } = useParams();
    const [home, setHome] = useState(null);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHomeDetails();
    }, [id]);

    const fetchHomeDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/home/${id}`);
            setHome(response.data);
        } catch (err) {
            setError('Failed to fetch home details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">{home?.name}</h1>
                    <button
                        onClick={() => setShowAddDevice(true)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Add Device
                    </button>
                </div>
                <p className="mt-2 text-gray-600">{home?.address}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-6">Devices</h2>
                        <DeviceList homeId={id} />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <MemberManagement homeId={id} />
                </div>
            </div>

            {showAddDevice && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <AddDeviceForm
                            homeId={id}
                            onSuccess={() => {
                                setShowAddDevice(false);
                                fetchHomeDetails();
                            }}
                            onCancel={() => setShowAddDevice(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
