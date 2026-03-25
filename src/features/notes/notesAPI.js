import API from "../../services/api";

export const getNotes = async ({ page = 1, limit = 5 }) => {
    const res = await API.get(`/notes?page=${page}&limit=${limit}`);
    return res.data;
};

export const createNote = async (data) => {
    const res = await API.post("/notes", data);
    return res.data;
};

export const deleteNote = async (id) => {
    const res = await API.delete(`/notes/${id}`);
    return res.data;
};

export const updateNote = async ({ id, ...data }) => {
    const res = await API.put(`/notes/${id}`, data);
    return res.data;
};