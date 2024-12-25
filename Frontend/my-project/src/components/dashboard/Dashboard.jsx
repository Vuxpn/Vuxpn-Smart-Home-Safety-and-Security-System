import { useState } from 'react';
import { useHome } from '../../contexts/HomeContext';
import HomeCard from '../home/HomeCard';
import CreateHomeForm from '../home/CreateHomeForm';
import DeviceList from '../device/DeviceList';
import AddDeviceForm from '../device/AddDeviceForm';
import MemberManagement from '../home/MemberManagement';
import { toast } from 'react-toastify';
import Navbar from '../layout/Navbar';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
    const { homes, currentHome, loading, error, setCurrentHome, fetchHomeDetails } = useHome();
    const [showCreateHome, setShowCreateHome] = useState(false);
    const [showAddDevice, setShowAddDevice] = useState(false);
    const [showManageMembers, setShowManageMembers] = useState(false);

    // Check if homes is an array before proceeding
    if (!Array.isArray(homes)) {
        console.error('Expected homes to be an array, but got:', homes);
        return <div>Error: Homes data is not available.</div>;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    const handleHomeSuccess = () => {
        setShowCreateHome(false);
    };

    const handleDeviceSuccess = async () => {
        setShowAddDevice(false);
        if (currentHome) {
            await fetchHomeDetails(currentHome._id);
        }
    };

    const handleDeleteSuccess = () => {
        toast.success('Home deleted successfully');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                        <button
                            onClick={() => setShowCreateHome(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <svg
                                className="-ml-1 mr-2 h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Create New Home
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <HomeIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">Total Homes</dt>
                                            <dd className="text-lg font-medium text-gray-900">{homes.length}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Add more stats cards as needed */}
                    </div>

                    {showCreateHome && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Create New Home</h2>
                                    <button
                                        onClick={() => setShowCreateHome(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <CreateHomeForm onSuccess={handleHomeSuccess} />
                            </div>
                        </div>
                    )}

                    {homes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No homes yet. Create your first home to get started!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {homes.map((home) => (
                                <HomeCard
                                    key={home._id}
                                    home={home}
                                    onEdit={() => setCurrentHome(home)}
                                    onDelete={handleDeleteSuccess}
                                    onManageMembers={() => {
                                        setCurrentHome(home);
                                        setShowManageMembers(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {currentHome && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Devices in {currentHome.name}</h2>
                                <button
                                    onClick={() => setShowAddDevice(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Add Device
                                </button>
                            </div>
                            <DeviceList homeId={currentHome._id} key={currentHome._id} />
                        </div>
                    )}

                    {showAddDevice && currentHome && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Add New Device</h2>
                                    <button
                                        onClick={() => setShowAddDevice(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <AddDeviceForm
                                    homeId={currentHome._id}
                                    onSuccess={handleDeviceSuccess}
                                    onCancel={() => setShowAddDevice(false)}
                                />
                            </div>
                        </div>
                    )}

                    {showManageMembers && currentHome && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">Manage Members</h2>
                                    <button
                                        onClick={() => setShowManageMembers(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <span className="sr-only">Close</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <MemberManagement homeId={currentHome._id} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
