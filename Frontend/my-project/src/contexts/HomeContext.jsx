import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { toast } from 'react-toastify';

const HomeContext = createContext(null);

export const HomeProvider = ({ children }) => {
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentHome, setCurrentHome] = useState(null);

    // Fetch all homes
    const fetchHomes = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/home');
            // Fetch devices for each home
            const homesWithDevices = await Promise.all(
                response.data.map(async (home) => {
                    try {
                        const devicesResponse = await axiosInstance.get(`/device/home/${home._id}`);
                        return {
                            ...home,
                            devices: devicesResponse.data.data || [],
                        };
                    } catch (err) {
                        console.error(`Error fetching devices for home ${home._id}:`, err);
                        return {
                            ...home,
                            devices: [],
                        };
                    }
                }),
            );
            setHomes(homesWithDevices);
            setError(null);
        } catch (err) {
            setError('Failed to fetch homes');
            console.error('Error fetching homes:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch single home details
    const fetchHomeDetails = async (homeId) => {
        try {
            setLoading(true);
            // Gọi cả 2 API để lấy thông tin home và devices
            const [homeResponse, devicesResponse] = await Promise.all([
                axiosInstance.get(`/home/${homeId}`),
                axiosInstance.get(`/device/${homeId}`),
            ]);

            // Combine home data with devices
            const homeWithDevices = {
                ...homeResponse.data,
                devices: devicesResponse.data || [], // Removed .data since your backend returns device directly
            };

            // Cập nhật trong danh sách homes
            setHomes((prevHomes) => prevHomes.map((home) => (home._id === homeId ? homeWithDevices : home)));

            setCurrentHome(homeWithDevices);
            setError(null);
            return homeWithDevices;
        } catch (err) {
            if (err.response?.status === 404) {
                // Nếu không tìm thấy devices, set mảng rỗng
                const homeResponse = await axiosInstance.get(`/home/${homeId}`);
                const homeWithEmptyDevices = {
                    ...homeResponse.data,
                    devices: [],
                };

                setHomes((prevHomes) => prevHomes.map((home) => (home._id === homeId ? homeWithEmptyDevices : home)));

                setCurrentHome(homeWithEmptyDevices);
                setError(null);
                return homeWithEmptyDevices;
            } else {
                setError('Failed to fetch home details');
                console.error('Error fetching home details:', err);
                throw err;
            }
        } finally {
            setLoading(false);
        }
    };

    // Create new home
    const createHome = async (homeData) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/home/create', homeData);
            setHomes((prevHomes) => [...prevHomes, response.data]);
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to create home');
            console.error('Error creating home:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update home
    const updateHome = async (homeId, updateData) => {
        try {
            setLoading(true);
            const response = await axiosInstance.put(`/home/update/${homeId}`, updateData);
            setHomes(homes.map((home) => (home._id === homeId ? { ...home, ...response.data } : home)));
            if (currentHome?._id === homeId) {
                setCurrentHome({ ...currentHome, ...response.data });
            }
            setError(null);
            return response.data;
        } catch (err) {
            setError('Failed to update home');
            console.error('Error updating home:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete home
    const deleteHome = async (homeId) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`/home/delete/${homeId}`);
            setHomes(homes.filter((home) => home._id !== homeId));
            if (currentHome?._id === homeId) {
                setCurrentHome(null);
            }
            setError(null);
            toast.success('🏠 Xoá nhà thành thành công!', {
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
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete home';
            setError(errorMessage);
            toast.error('❌ Không thể xoá nhà. Vui lòng thử lại!', {
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
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Manage members
    const addMember = async (homeId, email) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(`/home/${homeId}/members`, { email });

            // Cập nhật danh sách thành viên
            const updatedMembers = response.data.members;
            setHomes((prev) => prev.map((home) => (home._id === homeId ? { ...home, members: updatedMembers } : home)));

            if (currentHome?._id === homeId) {
                setCurrentHome((prev) => ({ ...prev, members: updatedMembers }));
            }

            toast.success('Thêm thành viên thành công!');
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Lỗi khi thêm thành viên';
            toast.error(errorMsg);
            throw errorMsg;
        } finally {
            setLoading(false);
        }
    };

    const removeMember = async (homeId, memberId) => {
        try {
            setLoading(true);
            await axiosInstance.delete(`/home/${homeId}/members/${memberId}`);

            // Update currentHome if we're viewing the home that was modified
            if (currentHome?._id === homeId) {
                setCurrentHome({
                    ...currentHome,
                    members: currentHome.members.filter((member) => member._id !== memberId),
                });
            }

            // Update the home in the homes list
            setHomes(
                homes.map((home) => {
                    if (home._id === homeId) {
                        return {
                            ...home,
                            members: home.members.filter((member) => member._id !== memberId),
                        };
                    }
                    return home;
                }),
            );

            setError(null);
            toast.success('Member removed successfully!', {
                position: 'top-right',
                autoClose: 3000,
                style: {
                    backgroundColor: '#f0fdf4',
                    color: '#166534',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                },
            });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to remove member';
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
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Load homes on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            fetchHomes();
        } else {
            setHomes([]);
            setCurrentHome(null);
        }
    }, []);

    const value = {
        homes,
        currentHome,
        loading,
        error,
        fetchHomes,
        fetchHomeDetails,
        createHome,
        updateHome,
        deleteHome,
        addMember,
        removeMember,
        setCurrentHome,
    };

    return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};

// Custom hook to use home context
export const useHome = () => {
    const context = useContext(HomeContext);
    if (!context) {
        throw new Error('useHome must be used within a HomeProvider');
    }
    return context;
};
