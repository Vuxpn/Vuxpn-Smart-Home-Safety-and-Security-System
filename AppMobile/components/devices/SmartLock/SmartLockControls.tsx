import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { showToast } from '../../../components/ui/Toast';
import smartLockService from '../../../services/smartLockService';
import { useRouter } from 'expo-router';

interface SmartLockControlsProps {
    deviceId: string;
    name: string;
    onRefreshStatus?: () => void;
}

const SmartLockControls: React.FC<SmartLockControlsProps> = ({ deviceId, name, onRefreshStatus }) => {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [isLocked, setIsLocked] = useState(true);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        fetchLockStatus();
    }, []);

    const fetchLockStatus = async () => {
        try {
            setIsLoading(true);
            const response = await smartLockService.getLockStatus(deviceId);
            if (response.success && response.data) {
                setIsLocked(response.data.locked);
                setFailedAttempts(response.data.failedAttempts);
                setLastUpdated(new Date(response.data.lastUpdated));
            }
        } catch (error) {
            console.error('Error fetching lock status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewLogs = () => {
        router.push(`/home/notification?filter=smartHome&deviceId=${deviceId}`);
    };

    const handleUnlock = async () => {
        if (!password || password.length !== 6) {
            showToast('error', 'Lỗi', 'Mật khẩu phải có đúng 6 ký tự');
            return;
        }

        try {
            setIsUnlocking(true);
            const response = await smartLockService.unlockDoor(deviceId, password);

            if (response.success) {
                showToast('success', 'Thành công', response.message || `Đã mở khóa ${name}`);
                setPassword(''); // Xóa mật khẩu sau khi mở khóa thành công
                // Cập nhật trạng thái và thông báo người dùng
                setIsLocked(false);
                // Gọi hàm làm mới trạng thái nếu có
                if (onRefreshStatus) onRefreshStatus();
            } else {
                showToast('error', 'Lỗi', response.message || 'Không thể mở khóa');
            }
        } catch (error: any) {
            const errorMsg = error.message || 'Không thể mở khóa';
            showToast('error', 'Lỗi', errorMsg);
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleLock = async () => {
        try {
            setIsLocking(true);
            const response = await smartLockService.lockDoor(deviceId);

            if (response.success) {
                showToast('success', 'Thành công', response.message || `Đã khóa ${name}`);
                // Cập nhật trạng thái và thông báo người dùng
                setIsLocked(true);
                // Gọi hàm làm mới trạng thái nếu có
                if (onRefreshStatus) onRefreshStatus();
            } else {
                showToast('error', 'Lỗi', response.message || 'Không thể khóa');
            }
        } catch (error: any) {
            const errorMsg = error.message || 'Không thể khóa';
            showToast('error', 'Lỗi', errorMsg);
        } finally {
            setIsLocking(false);
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || oldPassword.length !== 6) {
            showToast('error', 'Lỗi', 'Mật khẩu cũ phải có đúng 6 ký tự');
            return;
        }

        if (!newPassword || newPassword.length !== 6) {
            showToast('error', 'Lỗi', 'Mật khẩu mới phải có đúng 6 ký tự');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast('error', 'Lỗi', 'Mật khẩu mới không khớp');
            return;
        }

        try {
            setIsChangingPassword(true);
            const response = await smartLockService.changePassword(deviceId, oldPassword, newPassword);

            if (response.success) {
                showToast('success', 'Thành công', response.message || 'Đã đổi mật khẩu thành công');
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setShowChangePassword(false);
            } else {
                showToast('error', 'Lỗi', response.message || 'Không thể đổi mật khẩu');
            }
        } catch (error: any) {
            const errorMsg = error.message || 'Không thể đổi mật khẩu';
            showToast('error', 'Lỗi', errorMsg);
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Hiển thị trạng thái khóa */}
            <View style={styles.statusContainer}>
                <TouchableOpacity
                    style={styles.statusButton}
                    onPress={() => {
                        setShowStatus(!showStatus);
                        if (!showStatus) fetchLockStatus();
                    }}
                >
                    <Text style={styles.statusButtonText}>
                        {isLoading ? 'Đang tải...' : isLocked ? 'Đang khóa' : 'Đã mở khóa'}
                    </Text>
                    <MaterialIcons
                        name={showStatus ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={18}
                        color="#666"
                    />
                </TouchableOpacity>

                {showStatus && !isLoading && (
                    <View style={styles.statusDetails}>
                        <Text style={styles.statusText}>Trạng thái: {isLocked ? 'Đang khóa' : 'Đã mở khóa'}</Text>
                        <Text style={styles.statusText}>Số lần nhập sai: {failedAttempts}/5</Text>
                        {lastUpdated && (
                            <Text style={styles.statusText}>
                                Cập nhật: {lastUpdated.toLocaleTimeString()} {lastUpdated.toLocaleDateString()}
                            </Text>
                        )}
                        <View style={styles.statusActions}>
                            <TouchableOpacity style={styles.refreshButton} onPress={fetchLockStatus}>
                                <Text style={styles.refreshButtonText}>Làm mới</Text>
                                <Feather name="refresh-cw" size={14} color="#2196F3" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.viewLogsButton} onPress={handleViewLogs}>
                                <Text style={styles.viewLogsText}>Xem lịch sử</Text>
                                <Feather name="clock" size={14} color="#9C27B0" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.unlockButton]}
                    onPress={handleUnlock}
                    disabled={isUnlocking}
                >
                    {isUnlocking ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="lock-open" size={24} color="white" />
                            <Text style={styles.actionButtonText}>Mở khóa</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.lockButton]}
                    onPress={handleLock}
                    disabled={isLocking}
                >
                    {isLocking ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <MaterialIcons name="lock" size={24} color="white" />
                            <Text style={styles.actionButtonText}>Khóa</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.changePasswordButton]}
                    onPress={() => setShowChangePassword(!showChangePassword)}
                >
                    <Feather name="edit" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Đổi mật khẩu</Text>
                </TouchableOpacity>
            </View>

            {/* Ô nhập mật khẩu để mở khóa */}
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Nhập mật khẩu 6 số để mở khóa"
                    value={password}
                    onChangeText={setPassword}
                    keyboardType="number-pad"
                    maxLength={6}
                    secureTextEntry
                />
            </View>

            {/* Form đổi mật khẩu */}
            {showChangePassword && (
                <View style={styles.changePasswordForm}>
                    <Text style={styles.formTitle}>Đổi mật khẩu</Text>

                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Mật khẩu cũ"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        keyboardType="number-pad"
                        maxLength={6}
                        secureTextEntry
                    />

                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        keyboardType="number-pad"
                        maxLength={6}
                        secureTextEntry
                    />

                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        keyboardType="number-pad"
                        maxLength={6}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleChangePassword}
                        disabled={isChangingPassword}
                    >
                        {isChangingPassword ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Xác nhận</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statusContainer: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    statusButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#f5f5f5',
    },
    statusButtonText: {
        fontWeight: '600',
        color: '#333',
    },
    statusDetails: {
        padding: 12,
        backgroundColor: '#fff',
    },
    statusText: {
        marginBottom: 5,
        color: '#555',
    },
    statusActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
    },
    refreshButtonText: {
        color: '#2196F3',
        marginRight: 4,
        fontSize: 12,
    },
    viewLogsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 6,
    },
    viewLogsText: {
        color: '#9C27B0',
        marginRight: 4,
        fontSize: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 4,
    },
    unlockButton: {
        backgroundColor: '#4CAF50',
    },
    lockButton: {
        backgroundColor: '#F44336',
    },
    changePasswordButton: {
        backgroundColor: '#2196F3',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 4,
        fontSize: 12,
    },
    passwordContainer: {
        marginTop: 8,
    },
    passwordInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    changePasswordForm: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default SmartLockControls;
