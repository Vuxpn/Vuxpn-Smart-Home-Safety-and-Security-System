import { useState } from 'react';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';

export default function AddDeviceForm({ homeId, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        deviceId: '',
        name: '',
        type: '',
        description: '',
        homeId: homeId,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const deviceTypes = ['Light', 'Atmosphere Sensor', 'Security Camera', 'Other'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const devicePayload = {
                deviceId: formData.deviceId,
                name: formData.name,
                homeId: formData.homeId,
                type: formData.type,
                description: formData.description || undefined,
            };

            const response = await axiosInstance.post('/device/create', devicePayload);

            if (response.data.message) {
                toast.success(response.data.message, {
                    position: 'top-right',
                    autoClose: 3000,
                    style: {
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                    },
                });
            }

            onSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to add device';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 5000,
                style: {
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                },
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Add New Device</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Device ID</label>
                    <input
                        type="text"
                        required
                        value={formData.deviceId}
                        onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Device Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Device Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">Select type</option>
                        {deviceTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows="3"
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'Adding...' : 'Add Device'}
                    </button>
                </div>
            </form>
        </div>
    );
}
