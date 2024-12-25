import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomeProvider } from './contexts/HomeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DeviceProvider } from './contexts/DeviceContext';
import 'antd/dist/reset.css';
const LoginForm = React.lazy(() => import('./components/auth/LoginForm'));
const RegisterForm = React.lazy(() => import('./components/auth/RegisterForm'));
const Dashboard = React.lazy(() => import('./components/dashboard/Dashboard'));
const DeviceDetail = React.lazy(() => import('./pages/device/DeviceDetail'));
const PrivateRoute = React.lazy(() => import('./components/auth/PrivateRoute'));

const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
);

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    return !user ? children : <Navigate to="/" replace />;
};

const ProtectedLayout = ({ children }) => {
    return <HomeProvider>{children}</HomeProvider>;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <HomeProvider>
                    <DeviceProvider>
                        <div className="min-h-screen bg-gray-100 py-3">
                            <Suspense fallback={<LoadingSpinner />}>
                                <Routes>
                                    <Route
                                        path="/login"
                                        element={
                                            <PublicRoute>
                                                <LoginForm />
                                            </PublicRoute>
                                        }
                                    />
                                    <Route
                                        path="/register"
                                        element={
                                            <PublicRoute>
                                                <RegisterForm />
                                            </PublicRoute>
                                        }
                                    />
                                    <Route
                                        path="/"
                                        element={
                                            <PrivateRoute>
                                                <ProtectedLayout>
                                                    <Dashboard />
                                                </ProtectedLayout>
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route
                                        path="/device/:deviceId"
                                        element={
                                            <PrivateRoute>
                                                <ProtectedLayout>
                                                    <DeviceDetail />
                                                </ProtectedLayout>
                                            </PrivateRoute>
                                        }
                                    />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </Suspense>
                            <ToastContainer
                                position="top-right"
                                autoClose={5000}
                                hideProgressBar={false}
                                newestOnTop
                                closeOnClick
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                            />
                        </div>
                    </DeviceProvider>
                </HomeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
