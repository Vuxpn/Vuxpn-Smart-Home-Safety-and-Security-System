import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';
import AtmosphereSensorDetail from '../../components/device/AtmosphereSensorDetail';
import DetechImage from '../../components/device/DetechImage';
import SmartHomeLights from '../../components/device/LightControl';

export default function DeviceDetail() {
    const { deviceId } = useParams();
    const navigate = useNavigate();
    const [device, setDevice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [warningSettings, setWarningSettings] = useState({
        gasValue: 0,
        temValue: 0,
    });
    const [warningState, setWarningState] = useState('off');

    useEffect(() => {
        fetchDeviceDetails();
    }, [deviceId]);

    const fetchDeviceDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/device/detail/${deviceId}`);
            if (!response.data.state === 'ACTIVE') {
                toast.error('Device is not connected');
                navigate(-1);
                return;
            }
            setDevice(response.data);
            // Fetch current warning settings if it's an atmosphere sensor
            // if (response.data.type === 'Atmosphere Sensor') {
            //     const warningResponse = await axiosInstance.post(`/device/${deviceId}/warningLevel`);
            //     setWarningSettings(warningResponse.data);
            //     setWarningState(warningResponse.data.state || 'off');
            // }
        } catch (err) {
            setError('Failed to fetch device details');
            toast.error('Failed to fetch device details');
        } finally {
            setLoading(false);
        }
    };

    const handleWarningControl = async (state) => {
        try {
            // Call the appropriate API endpoint based on the current state
            if (state === 'off') {
                await axiosInstance.post(`/device/${device.deviceId}/onwarning`);
                setWarningState('on');
                toast.success('Warning activated');
            } else {
                await axiosInstance.post(`/device/${device.deviceId}/offwarning`);
                setWarningState('off');
                toast.success('Warning deactivated');
            }
        } catch (err) {
            toast.error('Failed to control warning');
        }
    };

    const handleWarningLevelChange = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/device/${device.deviceId}/warningLevel`, {
                deviceId,
                ...warningSettings,
            });
            toast.success('Warning levels updated successfully');
        } catch (err) {
            toast.error('Failed to update warning levels');
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
        return <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>;
    }

    if (!device) {
        return <div>No device found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <div className="space-y-6">
                {/* Device Header */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4 ">
                    <div className="px-4 py-5 sm:px-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">{device.name}</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    {device.type} - {device.deviceId}
                                </p>
                            </div>
                            <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    device.state === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {device.state === 'ACTIVE' ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>

                {device.type === 'Atmosphere Sensor' && device.state === 'ACTIVE' && (
                    <AtmosphereSensorDetail device={device} />
                )}

                {device.type === 'Security Camera' && device.state === 'ACTIVE' && (
                    <DetechImage deviceId={device.deviceId} />
                )}

                {device.type === 'Light' && device.state === 'ACTIVE' && <SmartHomeLights />}

                {/* Warning Controls - Only for Atmosphere Sensors */}
                {device.type === 'Atmosphere Sensor' && device.state === 'ACTIVE' && (
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Warning Settings</h3>

                            {/* Warning Toggle */}
                            <div className="mt-4">
                                <button
                                    onClick={() => handleWarningControl(warningState)}
                                    className={`${
                                        warningState === 'on'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                    } px-4 py-2 text-white rounded-md`}
                                >
                                    {warningState === 'on' ? 'Disable Warning' : 'Enable Warning'}
                                </button>
                            </div>

                            {/* Warning Levels Form */}
                            <form onSubmit={handleWarningLevelChange} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Gas Warning Level (ppm)
                                    </label>
                                    <input
                                        type="number"
                                        value={warningSettings.gasValue}
                                        onChange={(e) =>
                                            setWarningSettings((prev) => ({
                                                ...prev,
                                                gasValue: Number(e.target.value),
                                            }))
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Temperature Warning Level (°C)
                                    </label>
                                    <input
                                        type="number"
                                        value={warningSettings.temValue}
                                        onChange={(e) =>
                                            setWarningSettings((prev) => ({
                                                ...prev,
                                                temValue: Number(e.target.value),
                                            }))
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Update Warning Levels
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
