import API from "../../services/api";

export const loginUser = async (data) => {
  const res = await API.post("/auth/login", data);
  return res.data;
};

export const googleLoginApi = async (data) => {
  const res = await API.post("/auth/google", data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

export const getMe = async () => {
  const token = localStorage.getItem("token");

  const res = await API.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};