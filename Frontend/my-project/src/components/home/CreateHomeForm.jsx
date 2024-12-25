import { useState } from 'react';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';
export default function CreateHomeForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axiosInstance.post('/home/create', formData);
            if (response.data) {
                toast.success('🏠 Thêm nhà mới thành công!', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    style: {
                        backgroundColor: '#f0fdf4',
                        color: '#166534',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0',
                    },
                });
                setFormData({ name: '', address: '', description: '' });
                onSuccess();
            }
        } catch (err) {
            console.error('Error creating home:', err);
            setError('Failed to create home');
            toast.error('❌ Không thể thêm nhà mới. Vui lòng thử lại!', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
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
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div className="transition-all duration-200 ease-in-out hover:shadow-md p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Home Name</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200"
                        placeholder="Enter home name"
                    />
                </div>

                <div className="transition-all duration-200 ease-in-out hover:shadow-md p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200"
                        placeholder="Enter address"
                    />
                </div>

                <div className="transition-all duration-200 ease-in-out hover:shadow-md p-4 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200"
                        rows="4"
                        placeholder="Enter description"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-1 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {loading ? (
                    <span className="flex items-center">
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Creating...
                    </span>
                ) : (
                    'Create Home'
                )}
            </button>
        </form>
    );
}
