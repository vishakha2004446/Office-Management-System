import { Link } from "react-router-dom"
import RegisterForm from "../../components/forms/RegisterForm"


const Register = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div>
                <RegisterForm />

                <p className="text-center mt-3 text-sm">
                    Already have an account?{" "}
                    <Link to="/" className="text-blue-500 hover:underline">
                        Login
                    </Link>
                </p>
            </div>

        </div>
    );
};

export default Register;