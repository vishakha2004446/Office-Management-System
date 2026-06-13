import { useContext, useState } from "react"
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const LoginForm = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const { data } = await API.post("/auth/login", form);
            login(data);

            if (data.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/user");
            }
        } catch (error) {
            alert(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded shadow-md w-80"
        >
            <h2 className="text-xl font-bold mb-4 text-center">Login</h2>

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
                className="w-full mb-4 px-3 py-2 border rounded"
            />
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
};

export default LoginForm