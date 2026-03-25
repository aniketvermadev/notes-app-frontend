import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createPaymentIntent } from "./paymentAPI";

const initialState = {
    clientSecret: null,
    loading: false,
    error: null
};

export const createPaymentIntentFunc = createAsyncThunk(
    "payment/createPaymentIntent",
    async (_, thunkAPI) => {
        try {
            return await createPaymentIntent();
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data);
        }
    }
);

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createPaymentIntentFunc.pending, (state) => {
                state.loading = true;
            })
            .addCase(createPaymentIntentFunc.fulfilled, (state, action) => {
                state.loading = false;
                state.clientSecret = action.payload.clientSecret;
            })
            .addCase(createPaymentIntentFunc.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default paymentSlice.reducer;