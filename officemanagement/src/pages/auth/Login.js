import { Link } from "react-router-dom"
import LoginForm from "../../components/forms/LoginForm"


const Login = () =>{
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div>
                <LoginForm/>

                <p className="text-center mt-3 text-sm">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-500 hover:underline">
                    register
                    </Link>
                </p>
            </div>

        </div>
    );
};

export default Login;