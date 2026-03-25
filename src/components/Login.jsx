import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { googleLogin, login, userDetails } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../services/api";

const Login = ({ switchToRegister }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { loading, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await dispatch(login(form)).unwrap();
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
        }
    };

    const handleSuccess = async (credentialResponse) => {
        try {
            await dispatch(googleLogin({ token: credentialResponse.credential })).unwrap();
            navigate("/dashboard");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[350px]">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />

                    <button
                        type="submit"
                        className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <GoogleLogin
                        onSuccess={handleSuccess}
                        onError={() => alert("Login Failed")}
                        text="continue_with"
                        width="100%"
                    />

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                </form>

                <p
                    onClick={switchToRegister}
                    disabled={loading}
                    className="text-center text-blue-500 mt-4 cursor-pointer hover:underline"
                >
                    Don't have an account? Register
                </p>
            </div>
        </div>
    );
};

export default Login;