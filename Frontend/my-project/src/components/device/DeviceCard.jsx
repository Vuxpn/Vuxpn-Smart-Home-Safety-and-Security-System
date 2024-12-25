import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function DeviceCard({ device, onConnect, onDisconnect, onDelete }) {
    const navigate = useNavigate();
    const isConnected = device.state === 'ACTIVE';

    const handleControlClick = () => {
        if (!isConnected) {
            toast.warning('Please connect the device first!', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }
        navigate(`/device/${device._id}`);
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{device.name}</h3>
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>

                <div className="mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {device.type}
                    </span>
                </div>

                {device.description && <p className="mt-2 text-sm text-gray-500">{device.description}</p>}

                <div className="mt-6 flex space-x-3">
                    <button
                        onClick={() => (isConnected ? onDisconnect(device.deviceId) : onConnect(device.deviceId))}
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                            isConnected ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </button>

                    {
                        <button
                            onClick={handleControlClick}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Control
                        </button>
                    }

                    <button
                        onClick={() => onDelete(device.deviceId)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
