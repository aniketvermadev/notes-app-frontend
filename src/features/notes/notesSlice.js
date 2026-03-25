import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createNote, deleteNote, getNotes, updateNote } from "./NotesAPI";

const initialState = {
    notes: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    hasMore: true
};

// 🔥 GET NOTES
export const fetchNotes = createAsyncThunk(
    "notes/fetchNotes",
    async ({ page = 1, limit = 5 }, thunkAPI) => {
        try {
            return await getNotes({ page, limit });
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
);

// 🔥 CREATE NOTE
export const addNote = createAsyncThunk(
    "notes/addNote",
    async (data, thunkAPI) => {
        try {
            return await createNote(data);
        } catch (err) {
            return thunkAPI.rejectWithValue(err);
        }
    }
);

// DELETE NOTE
export const deleteNoteFunc = createAsyncThunk(
    "notes/deleteNote",
    async (id, thunkAPI) => {
        try {
            return await deleteNote(id);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data);
        }
    }
);

// UPDATE NOTE
export const updateNoteFunc = createAsyncThunk(
    "notes/updateNote",
    async (data, thunkAPI) => {
        try {
            return await updateNote(data);
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data);
        }
    }
);

const notesSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotes.pending, (state, action) => {
                state.loading = true;
                state.currentPage = action.meta.arg.page;
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.loading = false;
                if (action.meta.arg.page === 1) {
                    state.notes = action.payload.notes;
                } else {
                    state.notes = [...state.notes, ...action.payload.notes];
                }   
                state.currentPage = action.payload.page;
                state.totalPages = action.payload.total;
                state.hasMore = action.payload.page < action.payload.total
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteNoteFunc.fulfilled, (state, action) => {
                state.notes = state.notes.filter(
                    (note) => note._id !== action.meta.arg
                );
            })
            .addCase(addNote.fulfilled, (state, action) => {
                state.notes = [action.payload, ...state.notes];
            })
            .addCase(updateNoteFunc.fulfilled, (state, action) => {
                const updatedNote = action.payload;

                state.notes = state.notes.map((note) =>
                    note._id === updatedNote._id ? updatedNote : note
                );
            });
    }
});

export default notesSlice.reducer;