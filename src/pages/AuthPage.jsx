import { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    const { token } = useSelector((state) => state.auth);

    if (token) {
        return <Navigate to="/dashboard" />;
    }

    return isLogin ? (
        <>
            <Login switchToRegister={() => setIsLogin(false)} />
        </>
    ) : (
        <Register switchToLogin={() => setIsLogin(true)} />
    );
};

export default AuthPage;