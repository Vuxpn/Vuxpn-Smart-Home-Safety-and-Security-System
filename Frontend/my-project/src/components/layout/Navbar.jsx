import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-indigo-600">
                                IOT System
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Menu as="div" className="ml-3 relative">
                            <div>
                                <Menu.Button className="flex items-center space-x-4">
                                    <span className="text-gray-700">{user?.name || user?.email}</span>
                                    <img
                                        className="h-8 w-8 rounded-full"
                                        src={user?.avatar || 'https://via.placeholder.com/32'}
                                        alt="User avatar"
                                    />
                                </Menu.Button>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/profile"
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } block px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    Profile
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </div>
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                                                >
                                                    Logout
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </nav>
    );
}
