import { useState } from "react"
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const RegisterForm = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            await API.post("/auth/register", form);
            alert("Registration successful!");
            navigate("/")
        } catch (error) {
            alert(error.reponse?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-md w-80"
        >
            <h2 className="text-xl font-bold mb-4 text-center">Register</h2>

            <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full mb-3 px-3 py-2 border ronded"
            />

            <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full mb-3 px-3 py-2 border rounded"
            />
            <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full mb-3 px-3 py-2 border rounded"
            />
            <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full mb-4 px-3 py-2 border rounded"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
            >
                {loading ? "Registering..." : "Register"}
            </button>
        </form>
    );
};

export default RegisterForm;