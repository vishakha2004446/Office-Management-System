import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import API from "../../services/api";

const ViewProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await API.get("/users/profile");
                setProfile(data);
            } catch (err) {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <div className="flex-1 bg-gray-100 ml-64 overflow-y-auto">
                <Navbar />

                <div className="p-6 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-6">My Profile</h2>

                    {loading ? (
                        <Loader />
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">

                            {/* Avatar placeholder */}
                            <div className="flex items-center gap-5 mb-6 pb-6 border-b">
                                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold select-none">
                                    {profile.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {profile.name}
                                    </h3>
                                    <span className="inline-block mt-1 px-3 py-0.5 text-sm rounded-full bg-blue-100 text-blue-700 capitalize">
                                        {profile.role}
                                    </span>
                                </div>
                            </div>

                            {/* Profile fields */}
                            <div className="space-y-4">
                                <ProfileRow label="Full Name" value={profile.name} />
                                <ProfileRow label="Email Address" value={profile.email} />
                                <ProfileRow
                                    label="Department"
                                    value={profile.department?.name || "Not assigned"}
                                />
                                <ProfileRow
                                    label="Role"
                                    value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                                />
                                <ProfileRow
                                    label="Member Since"
                                    value={new Date(profile.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                />
                            </div>

                            {/* Action button */}
                            <div className="mt-8">
                                <Link
                                    to="/user/profile/edit"
                                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium transition-colors"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Small reusable row component
const ProfileRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <span className="w-40 text-sm font-medium text-gray-500 shrink-0">{label}</span>
        <span className="text-gray-800">{value}</span>
    </div>
);

export default ViewProfile;
