import { useEffect, useState } from "react";
import API from "../../services/api";
import Loader from "../../components/common/Loader";
import Sidebar from "../../components/common/Sidebar";
import Navbar from "../../components/common/Navbar";

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTasks = async () => {
        try {
            const { data } = await API.get("/tasks");
            setTasks(data);
        } catch {
            setError("Failed to fetch tasks");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/tasks/${id}`, { status });
            fetchTasks();
        } catch {
            setError("Update failed");
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">My Tasks</h2>

                    {error && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="bg-white p-4 rounded shadow">
                            {tasks.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">
                                    No tasks assigned yet.
                                </p>
                            ) : (
                                <table className="w-full border">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="p-2 border">Title</th>
                                            <th className="p-2 border">Status</th>
                                            <th className="p-2 border">Update</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map((task) => (
                                            <tr key={task._id}>
                                                <td className="p-2 border">{task.title}</td>
                                                <td className="p-2 border capitalize">{task.status}</td>
                                                <td className="p-2 border">
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => updateStatus(task._id, e.target.value)}
                                                        className="border p-1 rounded"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in-progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;
