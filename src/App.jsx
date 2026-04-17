import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userDetails } from './features/auth/authSlice';
import Users from './pages/Users';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token) {
      dispatch(userDetails());
    }
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthPage />} />

        {/* 🔒 Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
