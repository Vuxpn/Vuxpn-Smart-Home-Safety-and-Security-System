import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const SmartHomeLights = ({ deviceId }) => {
    const [rooms, setRooms] = useState({
        livingRoom: false,
        kitchen: false,
        bedroom: false,
    });
    const [loading, setLoading] = useState({
        livingRoom: false,
        kitchen: false,
        bedroom: false,
    });
    const [error, setError] = useState('');

    const toggleLight = async (room) => {
        setLoading((prev) => ({ ...prev, [room]: true }));
        setError('');

        const endpoints = {
            livingRoom: {
                on: 'ledLivOn',
                off: 'ledLivOff',
            },
            kitchen: {
                on: 'ledKitOn',
                off: 'ledKitOff',
            },
            bedroom: {
                on: 'ledBedOn',
                off: 'ledBedOff',
            },
        };

        try {
            const endpoint = rooms[room] ? endpoints[room].off : endpoints[room].on;
            const response = await axiosInstance.post(`/device/${deviceId}/${endpoint}`);

            // Kiểm tra response và cập nhật trạng thái
            if (response.status === 200 || response.status === 201) {
                setRooms((prev) => ({
                    ...prev,
                    [room]: !prev[room],
                }));
            } else {
                throw new Error('Không thể điều khiển đèn');
            }
        } catch (err) {
            console.error('Error details:', err);
            setError('Đã xảy ra lỗi khi điều khiển đèn. Vui lòng thử lại.');
        } finally {
            setLoading((prev) => ({ ...prev, [room]: false }));
        }
    };

    const roomConfigs = [
        {
            id: 'livingRoom',
            name: 'Phòng Khách',
            bgColor: 'bg-blue-50',
            activeColor: 'bg-blue-500',
            hoverColor: 'hover:bg-blue-600',
            icon: '🛋️',
        },
        {
            id: 'kitchen',
            name: 'Phòng Bếp',
            bgColor: 'bg-green-50',
            activeColor: 'bg-green-500',
            hoverColor: 'hover:bg-green-600',
            icon: '🍳',
        },
        {
            id: 'bedroom',
            name: 'Phòng Ngủ',
            bgColor: 'bg-purple-50',
            activeColor: 'bg-purple-500',
            hoverColor: 'hover:bg-purple-600',
            icon: '🛏️',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="container mx-auto max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                    Hệ Thống Điều Khiển Đèn Thông Minh
                </h1>

                {error && <div className="mb-6 mx-auto max-w-md p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

                <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
                    {roomConfigs.map((room) => (
                        <div
                            key={room.id}
                            className={`flex-1 rounded-xl p-6 ${room.bgColor} shadow-lg transform transition-all duration-300 hover:shadow-xl`}
                        >
                            <div className="text-center pb-4">
                                <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
                                    <span>{room.icon}</span>
                                    <span>{room.name}</span>
                                </h2>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="mb-6">
                                    <Lightbulb
                                        className={`w-16 h-16 ${rooms[room.id] ? 'text-yellow-400' : 'text-gray-400'} 
                    transition-all duration-300 transform ${rooms[room.id] ? 'scale-110' : 'scale-100'}`}
                                        fill={rooms[room.id] ? 'currentColor' : 'none'}
                                    />
                                </div>
                                <button
                                    className={`w-full max-w-xs text-lg py-4 px-6 rounded-lg font-semibold 
                    transition-all duration-300 disabled:opacity-50
                    ${rooms[room.id] ? room.activeColor : 'bg-gray-200'} 
                    ${rooms[room.id] ? 'text-white' : 'text-gray-700'}
                    ${room.hoverColor}`}
                                    disabled={loading[room.id]}
                                    onClick={() => toggleLight(room.id)}
                                >
                                    {loading[room.id] ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="animate-spin">⚪</span>
                                            <span>Đang xử lý...</span>
                                        </div>
                                    ) : rooms[room.id] ? (
                                        'Tắt đèn'
                                    ) : (
                                        'Bật đèn'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SmartHomeLights;
