import axios from "axios";

const API = axios.create({
  baseURL: "https://notes-app-backend-435q.onrender.com/api",
  timeout: 10000
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
 
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("logout"));
    }
    return Promise.reject(err.response?.data || err.message);
  }
);

export default API;