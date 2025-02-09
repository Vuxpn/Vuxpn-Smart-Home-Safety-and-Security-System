import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';
import { Card, List, Image, Typography, Space, DatePicker } from 'antd';
import { AlertOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/vi';

const { Text, Title } = Typography;

const DetechImage = ({ deviceId }) => {
    const [images, setImages] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const params = {
                    date: selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : null,
                };
                const response = await axiosInstance.get(`/detectionwarning/images/${deviceId}`, { params });

                // Sắp xếp theo thời gian mới nhất đầu tiên
                const sortedImages = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setImages(sortedImages);
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImages();
        const interval = setInterval(fetchImages, 30000);
        return () => clearInterval(interval);
    }, [deviceId, selectedDate]);

    return (
        <div
            style={{
                marginTop: '20px',
                padding: '24px',
                maxWidth: '900px',
                margin: '0 auto',
                height: '80vh',
                overflowY: 'auto',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
        >
            <div
                style={{
                    marginLeft: '30%',
                    display: 'flex',
                    justifyItems: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    padding: '0 16px',
                }}
            >
                <AlertOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                <Title level={4} style={{ margin: 0, justifyItems: 'center' }}>
                    Cảnh Báo Xâm Nhập
                </Title>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    padding: '0 16px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                    <Title level={4} style={{ margin: 0 }}>
                        Cảnh Báo Xâm Nhập
                    </Title>
                </div>
                <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Chọn ngày"
                    onChange={(date) => setSelectedDate(date)}
                    style={{ width: 200 }}
                    locale={{
                        lang: {
                            locale: 'vi',
                        },
                    }}
                />
            </div>

            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={images}
                renderItem={(item) => (
                    <List.Item>
                        <Card
                            style={{
                                width: '100%',
                                marginBottom: '8px',
                                backgroundColor: 'white',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                }}
                            >
                                {/* Phần thời gian - chiếm 25% */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flex: '0 0 25%',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: 'red',
                                            borderRadius: '50%',
                                        }}
                                    />
                                    <Text strong style={{ fontSize: '16px', whiteSpace: 'nowrap' }}>
                                        {new Date(item.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false,
                                        })}
                                    </Text>
                                </div>

                                {/* Phần ảnh - chiếm 30% */}
                                <div style={{ flex: '0 0 30%', textAlign: 'center' }}>
                                    <Image
                                        src={item.url}
                                        alt="Detection"
                                        style={{
                                            width: '120px',
                                            height: '80px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                        }}
                                    />
                                </div>

                                {/* Phần thông báo chuyển động - chiếm 45% */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        flex: '0 0 45%',
                                    }}
                                >
                                    <AlertOutlined style={{ fontSize: '14px', color: '#ff4d4f' }} />
                                    <Text
                                        style={{
                                            color: '#333',
                                            fontSize: '16px',
                                        }}
                                    >
                                        Phát hiện chuyển động
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default DetechImage;
