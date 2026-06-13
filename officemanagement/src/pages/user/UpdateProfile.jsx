import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const UpdateProfile = () => {
    const { updateUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get("/users/profile");
                setEmail(data.email);
            } catch {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword && newPassword !== confirmPassword) {
            return setError("New passwords do not match");
        }
        if (newPassword && newPassword.length < 6) {
            return setError("New password must be at least 6 characters");
        }
        if (newPassword && !currentPassword) {
            return setError("Please enter your current password to set a new one");
        }

        try {
            setSaving(true);
            const payload = { email };
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }
            const { data } = await API.put("/users/profile", payload);
            updateUser({ name: data.name, email: data.email });
            setSuccess("Profile updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => navigate("/user/profile"), 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">Update Profile</h2>

                    {loading ? (
                        <Loader />
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">

                            {error && (
                                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">

                                <div>
                                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b">
                                        Email Address
                                    </h3>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        New Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>

                                <div>
                                    <h3 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b">
                                        Change Password
                                        <span className="ml-2 text-xs font-normal text-gray-400">
                                            (leave blank to keep current)
                                        </span>
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter current password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Confirm new password"
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-6 py-2 rounded font-medium transition-colors"
                                    >
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/user/profile")}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>

                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateProfile;
