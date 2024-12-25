import { useHome } from '../../contexts/HomeContext';

export default function HomeCard({ home, onEdit, onDelete, onManageMembers }) {
    const { fetchHomeDetails, deleteHome } = useHome();

    const handleEdit = async () => {
        try {
            await fetchHomeDetails(home._id);
            onEdit(home);
        } catch (error) {
            console.error('Error fetching home details:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this home?')) {
            try {
                await deleteHome(home._id);
                // The homes list will be automatically updated through the context
            } catch (error) {
                console.error('Error deleting home:', error);
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{home.name}</h3>
                    <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {home.members?.length || 0} members
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {home.devices?.length || 0} devices
                        </span>
                    </div>
                </div>

                <p className="mt-2 text-sm text-gray-500">{home.address}</p>

                <div className="mt-6 flex space-x-3">
                    <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        View
                    </button>

                    <button
                        onClick={() => onManageMembers(home)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Manage Members
                    </button>

                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
