import React, { useEffect, useState, createContext, useContext, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Định nghĩa kiểu dữ liệu
type ToastType = 'success' | 'error' | 'info' | 'warning';
type ToastProps = {
    visible: boolean;
    type: ToastType;
    title: string;
    message: string;
    onClose: () => void;
};

// Tạo Context cho Toast
type ToastContextType = {
    showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
    hideToast: () => void;
};

const ToastContext = createContext<ToastContextType>({
    showToast: () => {},
    hideToast: () => {},
});

// Custom Toast Component
const CustomToast: React.FC<ToastProps> = ({ visible, type, title, message, onClose }) => {
    const translateY = useSharedValue(20);
    const opacity = useSharedValue(0);

    const config = {
        success: {
            backgroundColor: '#edf7ed',
            borderColor: '#4caf50',
            icon: 'checkmark-circle',
            iconColor: '#4caf50',
            titleColor: '#2e7d32',
            messageColor: '#388e3c',
        },
        error: {
            backgroundColor: '#fdeded',
            borderColor: '#f44336',
            icon: 'close-circle',
            iconColor: '#f44336',
            titleColor: '#d32f2f',
            messageColor: '#e53935',
        },
        info: {
            backgroundColor: '#e8f4fd',
            borderColor: '#2196f3',
            icon: 'information-circle',
            iconColor: '#2196f3',
            titleColor: '#1976d2',
            messageColor: '#1565c0',
        },
        warning: {
            backgroundColor: '#fff8e6',
            borderColor: '#ff9800',
            icon: 'alert-circle',
            iconColor: '#ff9800',
            titleColor: '#f57c00',
            messageColor: '#ef6c00',
        },
    };

    const currentConfig = config[type] || config.info;

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 15 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withSpring(20);
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    if (!visible) return null;

    return (
        <Pressable onPress={onClose} style={styles.pressable}>
            <Animated.View
                style={[
                    styles.container,
                    {
                        backgroundColor: currentConfig.backgroundColor,
                        borderLeftColor: currentConfig.borderColor,
                    },
                    animatedStyle,
                ]}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name={currentConfig.icon as any} size={24} color={currentConfig.iconColor} />
                </View>

                <View style={styles.contentContainer}>
                    <Text style={[styles.title, { color: currentConfig.titleColor }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {message ? (
                        <Text style={[styles.message, { color: currentConfig.messageColor }]} numberOfLines={2}>
                            {message}
                        </Text>
                    ) : null}
                </View>

                <Pressable style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={16} color="#757575" />
                </Pressable>
            </Animated.View>
        </Pressable>
    );
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState({
        visible: false,
        type: 'info' as ToastType,
        title: '',
        message: '',
    });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (type: ToastType, title: string, message: string, duration = 3000) => {
        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Show the toast
        setToast({
            visible: true,
            type,
            title,
            message,
        });

        // Auto hide after duration
        timeoutRef.current = setTimeout(() => {
            hideToast();
        }, duration);
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, visible: false }));
    };

    useEffect(() => {
        // Đăng ký toastFunction ngay khi component mount
        toastFunction = { showToast, hideToast };

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            // Xóa toastFunction khi component unmount
            toastFunction = null;
        };
    }, []);

    return (
        <>
            {children}
            <CustomToast
                visible={toast.visible}
                type={toast.type}
                title={toast.title}
                message={toast.message}
                onClose={hideToast}
            />
        </>
    );
};

// Hook to use toast
export const useToast = () => useContext(ToastContext);

// Styles
const styles = StyleSheet.create({
    pressable: {
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        zIndex: 999,
    },
    container: {
        width: width * 0.92,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderLeftWidth: 6,
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 6,
    },
    iconContainer: {
        marginRight: 14,
    },
    contentContainer: {
        flex: 1,
        paddingRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    message: {
        fontSize: 14,
        marginTop: 3,
        lineHeight: 20,
    },
    closeButton: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

// Tạo global function để sử dụng nếu không thể dùng hook
let toastFunction: ToastContextType | null = null;
export const registerToast = (toast: ToastContextType) => {
    toastFunction = toast;
};

// Hàm trợ giúp global
export const showToast = (type: ToastType, title: string, message: string, duration?: number) => {
    if (toastFunction) {
        toastFunction.showToast(type, title, message, duration);
    } else {
        console.warn('Toast chưa được khởi tạo. Cần đảm bảo ToastProvider đã được thêm vào ứng dụng.');
    }
};
