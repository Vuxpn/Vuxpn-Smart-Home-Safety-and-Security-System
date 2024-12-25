import { useState } from 'react';
import { useHome } from '../../contexts/HomeContext';

export default function MemberManagement({ homeId }) {
    const [email, setEmail] = useState('');
    const { addMember, removeMember, currentHome, loading } = useHome();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addMember(homeId, email);
            setEmail(''); // Clear input after successful addition
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await removeMember(homeId, memberId);
            } catch (error) {
                console.error('Error removing member:', error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter member's email"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {loading ? 'Adding...' : 'Add Member'}
                </button>
            </form>

            <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Current Members</h3>
                <ul className="mt-3 divide-y divide-gray-200">
                    {currentHome?.members?.map((member) => (
                        <li key={member._id} className="py-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                            <button
                                onClick={() => handleRemoveMember(member._id)}
                                className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                disabled={loading}
                            >
                                {loading ? (
                                    <svg
                                        className="animate-spin h-4 w-4 text-white"
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
                                ) : (
                                    'Remove'
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
