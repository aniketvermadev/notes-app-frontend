import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, userDetails } from "../features/auth/authSlice";

const Register = ({ switchToLogin }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register(form)).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                dispatch(userDetails());
            }
        });
        navigate("/dashboard")
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-[350px]">
                <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        name="name"
                        type="text"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <button
                        type="submit"
                        className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                </form>

                <p
                    onClick={switchToLogin}
                    className="text-center text-blue-500 mt-4 cursor-pointer hover:underline"
                >
                    Already have an account? Login
                </p>
            </div>
        </div>
    );
};

export default Register;