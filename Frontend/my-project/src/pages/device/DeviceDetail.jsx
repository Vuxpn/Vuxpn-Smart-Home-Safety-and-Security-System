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
        gasValue: '',
        temValue: '',
    });
    const [warningState, setWarningState] = useState('off');
    const [fanState, setFanState] = useState('off');
    const [cameraSettings, setCameraSettings] = useState({
        mode: 'normal',
        warningState: 'off',
        ledDuration: '',
        buzzerDuration: '',
    });

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

    const handleFanControl = async (state) => {
        try {
            // Call the appropriate API endpoint based on the current state
            if (state === 'off') {
                await axiosInstance.post(`/device/${device.deviceId}/onfanwarning`);
                setFanState('on');
                toast.success('Fan activated');
            } else {
                await axiosInstance.post(`/device/${device.deviceId}/offfanwarning`);
                setFanState('off');
                toast.success('Fan deactivated');
            }
            s;
        } catch (err) {
            toast.error('Failed to control warning');
        }
    };

    const handleWarningLevelChange = async (e) => {
        e.preventDefault();

        // Validate giá trị trước khi gửi
        if (warningSettings.gasValue === '' || warningSettings.temValue === '') {
            toast.error('Please enter valid warning levels');
            return;
        }

        try {
            await axiosInstance.post(`/device/${device.deviceId}/warningLevel`, {
                deviceId,
                gasValue: Number(warningSettings.gasValue),
                temValue: Number(warningSettings.temValue),
            });
            toast.success('Warning levels updated successfully');
        } catch (err) {
            toast.error('Failed to update warning levels');
        }
    };

    const handleModeChange = async (currentMode) => {
        try {
            if (currentMode === 'normal') {
                await axiosInstance.post(`/detectionwarning/safemode/${device.deviceId}`);
                setCameraSettings((prev) => ({ ...prev, mode: 'safe' }));
                toast.success('Changed to Safe mode');
            } else {
                await axiosInstance.post(`/detectionwarning/normalmode/${device.deviceId}`);
                setCameraSettings((prev) => ({ ...prev, mode: 'normal' }));
                toast.success('Changed to Normal mode');
            }
        } catch (err) {
            toast.error('Failed to change mode');
        }
    };

    const handleCameraWarning = async (currentState) => {
        try {
            if (currentState === 'off') {
                await axiosInstance.post(`/detectionwarning/${device.deviceId}/ondetectwarning`);
                setCameraSettings((prev) => ({ ...prev, warningState: 'on' }));
                toast.success('Warning activated');
            } else {
                await axiosInstance.post(`/detectionwarning/${device.deviceId}/offdetectwarning`);
                setCameraSettings((prev) => ({ ...prev, warningState: 'off' }));
                toast.success('Warning deactivated');
            }
        } catch (err) {
            toast.error('Failed to change warning state');
        }
    };

    const handleDurationChange = async (e) => {
        e.preventDefault();

        // Validate giá trị trước khi gửi
        if (cameraSettings.ledDuration === '' || cameraSettings.buzzerDuration === '') {
            toast.error('Please enter valid duration values');
            return;
        }

        try {
            // Gửi cập nhật thời gian LED
            await axiosInstance.post(`/detectionwarning/changetimeled/${device.deviceId}`, {
                timeout: Number(cameraSettings.ledDuration),
            });

            // Gửi cập nhật thời gian Buzzer
            await axiosInstance.post(`/detectionwarning/changetimebuzzer/${device.deviceId}`, {
                timeout: Number(cameraSettings.buzzerDuration),
            });

            toast.success('Duration settings updated successfully');
        } catch (err) {
            toast.error('Failed to update duration settings');
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

                {/* Warning Controls - Only for Atmosphere Sensors */}
                {device.type === 'Security Camera' && device.state === 'ACTIVE' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                        <div className="border-b border-gray-200 pb-4 mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Camera Settings</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Mode Control */}
                                <div>
                                    <button
                                        onClick={() => handleModeChange(cameraSettings.mode)}
                                        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200
                                            ${
                                                cameraSettings.mode === 'safe'
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                    >
                                        {cameraSettings.mode === 'safe'
                                            ? 'Switch to Normal Mode'
                                            : 'Switch to Safe Mode'}
                                    </button>
                                </div>

                                {/* Warning Control */}
                                <div>
                                    <button
                                        onClick={() => handleCameraWarning(cameraSettings.warningState)}
                                        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200
                                            ${
                                                cameraSettings.warningState === 'on'
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                    >
                                        {cameraSettings.warningState === 'on' ? 'Disable Warning' : 'Enable Warning'}
                                    </button>
                                </div>
                            </div>

                            {/* Duration Settings Form */}
                            <form onSubmit={handleDurationChange} className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Duration Settings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* LED Duration */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                LED Duration (seconds)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={cameraSettings.ledDuration}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setCameraSettings((prev) => ({
                                                            ...prev,
                                                            ledDuration: value === '' ? '' : Number(value),
                                                        }));
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                              placeholder:text-gray-400"
                                                    placeholder="Enter LED duration"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                                                    sec
                                                </span>
                                            </div>
                                        </div>

                                        {/* Buzzer Duration */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Buzzer Duration (seconds)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={cameraSettings.buzzerDuration}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setCameraSettings((prev) => ({
                                                            ...prev,
                                                            buzzerDuration: value === '' ? '' : Number(value),
                                                        }));
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                              placeholder:text-gray-400"
                                                    placeholder="Enter buzzer duration"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                                                    sec
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Update Duration Settings
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {device.type === 'Light' && device.state === 'ACTIVE' && <SmartHomeLights deviceId={device.deviceId} />}

                {/* Warning Controls - Only for Atmosphere Sensors */}
                {device.type === 'Atmosphere Sensor' && device.state === 'ACTIVE' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="border-b border-gray-200 pb-4 mb-6 ">
                            <h3 className="text-xl font-bold text-gray-900">Warning Settings</h3>
                        </div>

                        <div className="space-y-8">
                            {/* Control Buttons */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Warning Control */}
                                <div>
                                    <button
                                        onClick={() => handleWarningControl(warningState)}
                                        className={`
                              w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200
                              ${
                                  warningState === 'on'
                                      ? 'bg-red-500 hover:bg-red-600 text-white'
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                              }
                            `}
                                    >
                                        {warningState === 'on' ? 'Disable Warning' : 'Enable Warning'}
                                    </button>
                                </div>

                                {/* Fan Control */}
                                <div>
                                    <button
                                        onClick={() => handleFanControl(fanState)}
                                        className={`
                              w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200
                              ${
                                  fanState === 'on'
                                      ? 'bg-red-500 hover:bg-red-600 text-white'
                                      : 'bg-green-500 hover:bg-green-600 text-white'
                              }
                            `}
                                    >
                                        {fanState === 'on' ? 'Turn Off Fan' : 'Turn On Fan'}
                                    </button>
                                </div>
                            </div>

                            {/* Warning Levels Form */}
                            <form onSubmit={handleWarningLevelChange} className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Warning Level Settings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Gas Warning Level */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Gas Warning Level
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={warningSettings.gasValue}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setWarningSettings((prev) => ({
                                                            ...prev,
                                                            gasValue: value === '' ? '' : Number(value),
                                                        }));
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                              placeholder:text-gray-400"
                                                    placeholder="Enter gas warning level"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                                                    ppm
                                                </span>
                                            </div>
                                        </div>

                                        {/* Temperature Warning Level */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Temperature Warning Level
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={warningSettings.temValue}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setWarningSettings((prev) => ({
                                                            ...prev,
                                                            temValue: value === '' ? '' : Number(value),
                                                        }));
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                                                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                                              placeholder:text-gray-400"
                                                    placeholder="Enter temperature warning level"
                                                />
                                                <span className="absolute right-3 top-2.5 text-sm text-gray-500">
                                                    °C
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
